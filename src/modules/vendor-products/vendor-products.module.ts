import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorProduct } from './entities/vendor-product.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { VendorProductsService } from './vendor-products.service';
import { VendorProductsController } from './vendor-products.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([VendorProduct, Vendor, ProductVariant]),
    InventoryModule,
  ],
  controllers: [VendorProductsController],
  providers: [VendorProductsService],
  exports: [VendorProductsService, TypeOrmModule],
})
export class VendorProductsModule {}
