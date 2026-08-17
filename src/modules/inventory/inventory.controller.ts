import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { ReserveInventoryDto } from './dto/reserve-inventory.dto';
import { ReleaseInventoryDto } from './dto/release-inventory.dto';
import { DeductInventoryDto } from './dto/deduct-inventory.dto';
import { FilterInventoryHistoryDto } from './dto/filter-inventory-history.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('low-stock')
  getLowStock(@Query('threshold') threshold?: string) {
    const numericThreshold = threshold ? parseInt(threshold, 10) : 10;
    return this.inventoryService.getLowStock(numericThreshold);
  }

  @Get('history')
  findAllHistory(@Query() filterDto: FilterInventoryHistoryDto) {
    return this.inventoryService.findAllHistory(filterDto);
  }

  @Get('history/:vendorProductId')
  findHistoryByVendorProduct(
    @Param('vendorProductId', ParseIntPipe) vendorProductId: number,
    @Query() filterDto: FilterInventoryHistoryDto,
  ) {
    return this.inventoryService.findHistoryByVendorProduct(
      vendorProductId,
      filterDto,
    );
  }

  @Get('vendor-product/:vendorProductId')
  findByVendorProduct(
    @Param('vendorProductId', ParseIntPipe) vendorProductId: number,
  ) {
    return this.inventoryService.findByVendorProduct(vendorProductId);
  }

  @Post('adjust')
  adjustInventory(@Body() dto: AdjustInventoryDto) {
    return this.inventoryService.adjustInventory(dto);
  }

  @Post('reserve')
  reserveInventory(@Body() dto: ReserveInventoryDto) {
    return this.inventoryService.reserveInventory(dto);
  }

  @Post('release')
  releaseInventory(@Body() dto: ReleaseInventoryDto) {
    return this.inventoryService.releaseInventory(dto);
  }

  @Post('deduct')
  deductInventory(@Body() dto: DeductInventoryDto) {
    return this.inventoryService.deductInventory(dto);
  }
}
