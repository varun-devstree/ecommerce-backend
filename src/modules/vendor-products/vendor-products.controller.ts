import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { VendorProductsService } from './vendor-products.service';

@Controller('vendor-products')
export class VendorProductsController {
  constructor(private readonly vendorProductsService: VendorProductsService) {}

  @Get()
  findAll() {
    return this.vendorProductsService.findAll();
  }

  @Get('vendor/:vendorId')
  findByVendor(@Param('vendorId', ParseIntPipe) vendorId: number) {
    return this.vendorProductsService.findByVendor(vendorId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vendorProductsService.findOne(id);
  }
}
