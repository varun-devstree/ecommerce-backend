import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { InventoryHistory } from './entities/inventory-history.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryHistory)
    private readonly inventoryHistoryRepository: Repository<InventoryHistory>,
  ) {}

  findAll() {
    return this.inventoryRepository.find({
      relations: { vendor_product: true },
    });
  }

  findByVendorProduct(vendorProductId: number) {
    return this.inventoryRepository.findOne({
      where: { vendor_product_id: vendorProductId },
      relations: { vendor_product: true },
    });
  }

  findHistoryByVendorProduct(vendorProductId: number) {
    return this.inventoryHistoryRepository.find({
      where: { vendor_product_id: vendorProductId },
    });
  }
}
