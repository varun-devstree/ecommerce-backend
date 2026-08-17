import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorProduct } from './entities/vendor-product.entity';

@Injectable()
export class VendorProductsService {
  constructor(
    @InjectRepository(VendorProduct)
    private readonly vendorProductRepository: Repository<VendorProduct>,
  ) {}

  findAll() {
    return this.vendorProductRepository.find({
      relations: { vendor: true, product_variant: true },
    });
  }

  findOne(id: number) {
    return this.vendorProductRepository.findOne({
      where: { id },
      relations: { vendor: true, product_variant: true },
    });
  }

  findByVendor(vendorId: number) {
    return this.vendorProductRepository.find({
      where: { vendor_id: vendorId },
      relations: { product_variant: true },
    });
  }
}
