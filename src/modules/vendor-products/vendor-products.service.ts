import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorProduct } from './entities/vendor-product.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { InventoryService } from '../inventory/inventory.service';
import { CreateVendorProductDto } from './dto/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/update-vendor-product.dto';
import { FilterVendorProductDto } from './dto/filter-vendor-product.dto';
import { VendorProductStatus } from '../../common/enums/enums';

@Injectable()
export class VendorProductsService {
  constructor(
    @InjectRepository(VendorProduct)
    private readonly vendorProductRepository: Repository<VendorProduct>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    private readonly inventoryService: InventoryService,
  ) {}

  async create(dto: CreateVendorProductDto): Promise<VendorProduct> {
    const vendor = await this.vendorRepository.findOne({
      where: { id: dto.vendor_id },
    });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${dto.vendor_id} not found`);
    }

    const variant = await this.productVariantRepository.findOne({
      where: { id: dto.product_variant_id },
    });
    if (!variant) {
      throw new NotFoundException(
        `Product variant with ID ${dto.product_variant_id} not found`,
      );
    }

    if (dto.mrp !== undefined && dto.mrp !== null && dto.mrp < dto.selling_price) {
      throw new BadRequestException(
        `MRP (${dto.mrp}) cannot be less than selling price (${dto.selling_price})`,
      );
    }

    const existing = await this.vendorProductRepository.findOne({
      where: {
        vendor_id: dto.vendor_id,
        product_variant_id: dto.product_variant_id,
      },
    });
    if (existing) {
      throw new ConflictException(
        `Vendor product already exists for vendor ${dto.vendor_id} and product variant ${dto.product_variant_id}`,
      );
    }

    const vendorProduct = this.vendorProductRepository.create({
      vendor_id: dto.vendor_id,
      product_variant_id: dto.product_variant_id,
      selling_price: dto.selling_price,
      mrp: dto.mrp,
      status: dto.status || VendorProductStatus.ACTIVE,
    });

    const savedVendorProduct = await this.vendorProductRepository.save(vendorProduct);

    await this.inventoryService.createInitialInventory(
      savedVendorProduct.id,
      dto.initial_quantity || 0,
    );

    return this.findOne(savedVendorProduct.id);
  }

  async findAll(
    filterDto?: FilterVendorProductDto,
  ): Promise<{ data: VendorProduct[]; total: number; page: number; limit: number }> {
    const page = filterDto?.page || 1;
    const limit = filterDto?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.vendorProductRepository
      .createQueryBuilder('vp')
      .leftJoinAndSelect('vp.vendor', 'vendor')
      .leftJoinAndSelect('vp.product_variant', 'product_variant')
      .leftJoinAndSelect('product_variant.product', 'product')
      .leftJoinAndSelect('vp.inventory', 'inventory');

    if (filterDto?.vendor_id) {
      query.andWhere('vp.vendor_id = :vendorId', {
        vendorId: filterDto.vendor_id,
      });
    }

    if (filterDto?.product_variant_id) {
      query.andWhere('vp.product_variant_id = :variantId', {
        variantId: filterDto.product_variant_id,
      });
    }

    if (filterDto?.status) {
      query.andWhere('vp.status = :status', { status: filterDto.status });
    }

    query.orderBy('vp.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<VendorProduct> {
    const vp = await this.vendorProductRepository.findOne({
      where: { id },
      relations: {
        vendor: true,
        product_variant: { product: true },
        inventory: true,
      },
    });

    if (!vp) {
      throw new NotFoundException(`Vendor product with ID ${id} not found`);
    }

    return vp;
  }

  async findByVendor(vendorId: number): Promise<VendorProduct[]> {
    return this.vendorProductRepository.find({
      where: { vendor_id: vendorId },
      relations: {
        product_variant: { product: true },
        inventory: true,
      },
    });
  }

  async findByVariant(variantId: number): Promise<VendorProduct[]> {
    return this.vendorProductRepository.find({
      where: { product_variant_id: variantId, status: VendorProductStatus.ACTIVE },
      relations: {
        vendor: true,
        inventory: true,
      },
    });
  }

  async update(id: number, dto: UpdateVendorProductDto): Promise<VendorProduct> {
    const vp = await this.findOne(id);

    if (
      dto.selling_price !== undefined ||
      dto.mrp !== undefined
    ) {
      const newSellingPrice =
        dto.selling_price !== undefined ? dto.selling_price : vp.selling_price;
      const newMrp = dto.mrp !== undefined ? dto.mrp : vp.mrp;

      if (newMrp !== null && newMrp !== undefined && newMrp < newSellingPrice) {
        throw new BadRequestException(
          `MRP (${newMrp}) cannot be less than selling price (${newSellingPrice})`,
        );
      }

      vp.selling_price = newSellingPrice;
      vp.mrp = newMrp;
    }

    if (dto.status) {
      vp.status = dto.status;
    }

    await this.vendorProductRepository.save(vp);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const vp = await this.findOne(id);
    vp.status = VendorProductStatus.DELETED;
    await this.vendorProductRepository.save(vp);
    await this.vendorProductRepository.softRemove(vp);
    return { message: `Vendor product with ID ${id} soft deleted successfully` };
  }
}

