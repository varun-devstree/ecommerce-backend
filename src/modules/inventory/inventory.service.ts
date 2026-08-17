import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { InventoryHistory } from './entities/inventory-history.entity';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { ReserveInventoryDto } from './dto/reserve-inventory.dto';
import { ReleaseInventoryDto } from './dto/release-inventory.dto';
import { DeductInventoryDto } from './dto/deduct-inventory.dto';
import { FilterInventoryHistoryDto } from './dto/filter-inventory-history.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryHistory)
    private readonly inventoryHistoryRepository: Repository<InventoryHistory>,
  ) {}

  async createInitialInventory(
    vendorProductId: number,
    initialQuantity: number = 0,
  ): Promise<Inventory> {
    const existing = await this.inventoryRepository.findOne({
      where: { vendor_product_id: vendorProductId },
    });

    if (existing) {
      return existing;
    }

    const inventory = this.inventoryRepository.create({
      vendor_product_id: vendorProductId,
      quantity: initialQuantity,
      reserved_quantity: 0,
      available_quantity: initialQuantity,
    });

    const savedInventory = await this.inventoryRepository.save(inventory);

    await this.logHistory(
      vendorProductId,
      initialQuantity,
      'INITIAL_STOCK',
      'SYSTEM',
      savedInventory.id,
    );

    return savedInventory;
  }

  async findAll(): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      relations: { vendor_product: true },
    });
  }

  async findByVendorProduct(vendorProductId: number): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { vendor_product_id: vendorProductId },
      relations: { vendor_product: true },
    });

    if (!inventory) {
      throw new NotFoundException(
        `Inventory for vendor product ID ${vendorProductId} not found`,
      );
    }

    return inventory;
  }

  async getLowStock(threshold: number = 10): Promise<Inventory[]> {
    return this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.vendor_product', 'vendor_product')
      .where('inventory.available_quantity <= :threshold', { threshold })
      .getMany();
  }

  async adjustInventory(dto: AdjustInventoryDto): Promise<Inventory> {
    const inventory = await this.findByVendorProduct(dto.vendor_product_id);

    const newQuantity = inventory.quantity + dto.quantity;
    const newAvailable = newQuantity - inventory.reserved_quantity;

    if (newQuantity < 0) {
      throw new BadRequestException(
        `Cannot adjust inventory: total quantity cannot be negative (current: ${inventory.quantity}, change: ${dto.quantity})`,
      );
    }

    if (newAvailable < 0) {
      throw new BadRequestException(
        `Cannot adjust inventory: available stock would become negative (reserved: ${inventory.reserved_quantity})`,
      );
    }

    inventory.quantity = newQuantity;
    inventory.available_quantity = newAvailable;

    const updated = await this.inventoryRepository.save(inventory);

    await this.logHistory(
      dto.vendor_product_id,
      dto.quantity,
      dto.operation,
      dto.reference_type,
      dto.reference_id,
    );

    return updated;
  }

  async reserveInventory(dto: ReserveInventoryDto): Promise<Inventory> {
    const inventory = await this.findByVendorProduct(dto.vendor_product_id);

    if (inventory.available_quantity < dto.quantity) {
      throw new BadRequestException(
        `Insufficient available inventory to reserve. Available: ${inventory.available_quantity}, Requested: ${dto.quantity}`,
      );
    }

    inventory.reserved_quantity += dto.quantity;
    inventory.available_quantity = inventory.quantity - inventory.reserved_quantity;

    const updated = await this.inventoryRepository.save(inventory);

    await this.logHistory(
      dto.vendor_product_id,
      dto.quantity,
      'RESERVE',
      dto.reference_type || 'ORDER',
      dto.reference_id,
    );

    return updated;
  }

  async releaseInventory(dto: ReleaseInventoryDto): Promise<Inventory> {
    const inventory = await this.findByVendorProduct(dto.vendor_product_id);

    if (inventory.reserved_quantity < dto.quantity) {
      throw new BadRequestException(
        `Cannot release more than reserved quantity. Reserved: ${inventory.reserved_quantity}, Requested: ${dto.quantity}`,
      );
    }

    inventory.reserved_quantity -= dto.quantity;
    inventory.available_quantity = inventory.quantity - inventory.reserved_quantity;

    const updated = await this.inventoryRepository.save(inventory);

    await this.logHistory(
      dto.vendor_product_id,
      dto.quantity,
      'RELEASE',
      dto.reference_type || 'ORDER',
      dto.reference_id,
    );

    return updated;
  }

  async deductInventory(dto: DeductInventoryDto): Promise<Inventory> {
    const inventory = await this.findByVendorProduct(dto.vendor_product_id);
    const fromReserved = dto.from_reserved !== false;

    if (fromReserved) {
      if (inventory.reserved_quantity < dto.quantity) {
        throw new BadRequestException(
          `Cannot deduct from reserved: requested ${dto.quantity} exceeds reserved quantity of ${inventory.reserved_quantity}`,
        );
      }
      inventory.reserved_quantity -= dto.quantity;
      inventory.quantity -= dto.quantity;
    } else {
      if (inventory.available_quantity < dto.quantity) {
        throw new BadRequestException(
          `Cannot deduct stock: requested ${dto.quantity} exceeds available stock of ${inventory.available_quantity}`,
        );
      }
      inventory.quantity -= dto.quantity;
    }

    inventory.available_quantity = inventory.quantity - inventory.reserved_quantity;

    const updated = await this.inventoryRepository.save(inventory);

    await this.logHistory(
      dto.vendor_product_id,
      -dto.quantity,
      'DEDUCT',
      dto.reference_type || 'SHIPMENT',
      dto.reference_id,
    );

    return updated;
  }

  async findHistoryByVendorProduct(
    vendorProductId: number,
    filterDto?: FilterInventoryHistoryDto,
  ): Promise<{ data: InventoryHistory[]; total: number; page: number; limit: number }> {
    const page = filterDto?.page || 1;
    const limit = filterDto?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.inventoryHistoryRepository
      .createQueryBuilder('history')
      .where('history.vendor_product_id = :vendorProductId', { vendorProductId });

    if (filterDto?.operation) {
      query.andWhere('history.operation = :operation', {
        operation: filterDto.operation,
      });
    }

    if (filterDto?.reference_type) {
      query.andWhere('history.reference_type = :referenceType', {
        referenceType: filterDto.reference_type,
      });
    }

    query.orderBy('history.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total, page, limit };
  }

  async findAllHistory(
    filterDto?: FilterInventoryHistoryDto,
  ): Promise<{ data: InventoryHistory[]; total: number; page: number; limit: number }> {
    const page = filterDto?.page || 1;
    const limit = filterDto?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.inventoryHistoryRepository.createQueryBuilder('history');

    if (filterDto?.vendor_product_id) {
      query.andWhere('history.vendor_product_id = :vendorProductId', {
        vendorProductId: filterDto.vendor_product_id,
      });
    }

    if (filterDto?.operation) {
      query.andWhere('history.operation = :operation', {
        operation: filterDto.operation,
      });
    }

    if (filterDto?.reference_type) {
      query.andWhere('history.reference_type = :referenceType', {
        referenceType: filterDto.reference_type,
      });
    }

    if (filterDto?.reference_id) {
      query.andWhere('history.reference_id = :referenceId', {
        referenceId: filterDto.reference_id,
      });
    }

    query.orderBy('history.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total, page, limit };
  }

  private async logHistory(
    vendorProductId: number,
    quantity: number,
    operation: string,
    referenceType?: string,
    referenceId?: number,
  ): Promise<InventoryHistory> {
    const history = this.inventoryHistoryRepository.create({
      vendor_product_id: vendorProductId,
      quantity,
      operation,
      reference_type: referenceType,
      reference_id: referenceId,
    });

    return this.inventoryHistoryRepository.save(history);
  }
}
