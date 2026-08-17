import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('vendor-product/:vendorProductId')
  findByVendorProduct(@Param('vendorProductId', ParseIntPipe) vendorProductId: number) {
    return this.inventoryService.findByVendorProduct(vendorProductId);
  }

  @Get('history/:vendorProductId')
  findHistoryByVendorProduct(@Param('vendorProductId', ParseIntPipe) vendorProductId: number) {
    return this.inventoryService.findHistoryByVendorProduct(vendorProductId);
  }
}
