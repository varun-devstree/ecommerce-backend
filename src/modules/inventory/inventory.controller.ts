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
import { RESPONSE_MESSAGES } from '../../common/constants';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.INVENTORY.FETCH_ALL_SUCCESS)
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('low-stock')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.INVENTORY.FETCH_LOW_STOCK_SUCCESS)
  getLowStock(@Query('threshold') threshold?: string) {
    const numericThreshold = threshold ? parseInt(threshold, 10) : 10;
    return this.inventoryService.getLowStock(numericThreshold);
  }

  @Get('history')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.INVENTORY.FETCH_ALL_HISTORY_SUCCESS)
  findAllHistory(@Query() filterDto: FilterInventoryHistoryDto) {
    return this.inventoryService.findAllHistory(filterDto);
  }

  @Get('history/:vendorProductId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.INVENTORY.FETCH_VP_HISTORY_SUCCESS)
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
  @ResponseMessage(RESPONSE_MESSAGES.INVENTORY.FETCH_VP_SUCCESS)
  findByVendorProduct(
    @Param('vendorProductId', ParseIntPipe) vendorProductId: number,
  ) {
    return this.inventoryService.findByVendorProduct(vendorProductId);
  }

  @Post('adjust')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.INVENTORY.ADJUST_SUCCESS)
  adjustInventory(@Body() dto: AdjustInventoryDto) {
    return this.inventoryService.adjustInventory(dto);
  }

  @Post('reserve')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.INVENTORY.RESERVE_SUCCESS)
  reserveInventory(@Body() dto: ReserveInventoryDto) {
    return this.inventoryService.reserveInventory(dto);
  }

  @Post('release')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.INVENTORY.RELEASE_SUCCESS)
  releaseInventory(@Body() dto: ReleaseInventoryDto) {
    return this.inventoryService.releaseInventory(dto);
  }

  @Post('deduct')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.INVENTORY.DEDUCT_SUCCESS)
  deductInventory(@Body() dto: DeductInventoryDto) {
    return this.inventoryService.deductInventory(dto);
  }
}
