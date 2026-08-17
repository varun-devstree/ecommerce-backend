import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorProduct } from './entities/vendor-product.entity';
import { VendorProductsService } from './vendor-products.service';
import { VendorProductsController } from './vendor-products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VendorProduct])],
  controllers: [VendorProductsController],
  providers: [VendorProductsService],
  exports: [VendorProductsService, TypeOrmModule],
})
export class VendorProductsModule {}
