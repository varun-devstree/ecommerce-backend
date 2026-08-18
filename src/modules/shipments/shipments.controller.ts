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
  UseGuards,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { FilterShipmentDto } from './dto/filter-shipment.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(RESPONSE_MESSAGES.SHIPMENTS.CREATE_SUCCESS)
  create(@Body() dto: CreateShipmentDto) {
    return this.shipmentsService.createShipment(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.SHIPMENTS.FETCH_ALL_SUCCESS)
  findAll(@Query() filterDto: FilterShipmentDto) {
    return this.shipmentsService.findAll(filterDto);
  }

  @Get('order/:orderId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.SHIPMENTS.FETCH_ORDER_SUCCESS)
  findByOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.shipmentsService.findByOrder(orderId);
  }

  @Get('order-vendor/:orderVendorId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.SHIPMENTS.FETCH_VENDOR_ORDER_SUCCESS)
  findByVendorOrder(
    @Param('orderVendorId', ParseIntPipe) orderVendorId: number,
  ) {
    return this.shipmentsService.findByVendorOrder(orderVendorId);
  }

  @Get('agent/:agentId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.SHIPMENTS.FETCH_AGENT_SUCCESS)
  findByDeliveryAgent(@Param('agentId', ParseIntPipe) agentId: number) {
    return this.shipmentsService.findByDeliveryAgent(agentId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.SHIPMENTS.FETCH_ONE_SUCCESS)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'delivery_agent', 'delivery')
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.SHIPMENTS.UPDATE_STATUS_SUCCESS)
  updateShipmentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.shipmentsService.updateShipmentStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.SHIPMENTS.DELETE_SUCCESS)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.remove(id);
  }
}
