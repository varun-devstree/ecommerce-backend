import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { ReserveInventoryDto } from './dto/reserve-inventory.dto';
import { ReleaseInventoryDto } from './dto/release-inventory.dto';
import { DeductInventoryDto } from './dto/deduct-inventory.dto';
import { FilterInventoryHistoryDto } from './dto/filter-inventory-history.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Inventory records fetched successfully')
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('low-stock')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Low stock inventory items fetched successfully')
  getLowStock(@Query('threshold') threshold?: string) {
    const numericThreshold = threshold ? parseInt(threshold, 10) : 10;
    return this.inventoryService.getLowStock(numericThreshold);
  }

  @Get('history')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('All inventory history logs fetched successfully')
  findAllHistory(@Query() filterDto: FilterInventoryHistoryDto) {
    return this.inventoryService.findAllHistory(filterDto);
  }

  @Get('history/:vendorProductId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Inventory history logs fetched by vendor product ID successfully')
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
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Inventory fetched by vendor product ID successfully')
  findByVendorProduct(
    @Param('vendorProductId', ParseIntPipe) vendorProductId: number,
  ) {
    return this.inventoryService.findByVendorProduct(vendorProductId);
  }

  @Post('adjust')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Inventory stock adjusted successfully')
  adjustInventory(@Body() dto: AdjustInventoryDto) {
    return this.inventoryService.adjustInventory(dto);
  }

  @Post('reserve')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Inventory stock reserved successfully')
  reserveInventory(@Body() dto: ReserveInventoryDto) {
    return this.inventoryService.reserveInventory(dto);
  }

  @Post('release')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Inventory stock released successfully')
  releaseInventory(@Body() dto: ReleaseInventoryDto) {
    return this.inventoryService.releaseInventory(dto);
  }

  @Post('deduct')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Inventory stock deducted successfully')
  deductInventory(@Body() dto: DeductInventoryDto) {
    return this.inventoryService.deductInventory(dto);
  }
}
