import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { FilterShipmentDto } from './dto/filter-shipment.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Shipment created successfully')
  create(@Body() dto: CreateShipmentDto) {
    return this.shipmentsService.createShipment(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Shipments fetched successfully')
  findAll(@Query() filterDto: FilterShipmentDto) {
    return this.shipmentsService.findAll(filterDto);
  }

  @Get('order/:orderId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Shipments fetched by order ID successfully')
  findByOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.shipmentsService.findByOrder(orderId);
  }

  @Get('order-vendor/:orderVendorId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Shipment fetched by order vendor package ID successfully')
  findByVendorOrder(
    @Param('orderVendorId', ParseIntPipe) orderVendorId: number,
  ) {
    return this.shipmentsService.findByVendorOrder(orderVendorId);
  }

  @Get('agent/:agentId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Shipments fetched by delivery agent ID successfully')
  findByDeliveryAgent(@Param('agentId', ParseIntPipe) agentId: number) {
    return this.shipmentsService.findByDeliveryAgent(agentId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Shipment details fetched successfully')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.findOne(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Shipment status updated successfully')
  updateShipmentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.shipmentsService.updateShipmentStatus(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Shipment deleted successfully')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.remove(id);
  }
}
