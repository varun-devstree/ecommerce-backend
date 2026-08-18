import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { RESPONSE_MESSAGES } from '../../common/constants';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(RESPONSE_MESSAGES.ORDERS.CREATE_SUCCESS)
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.ORDERS.FETCH_ALL_SUCCESS)
  findAll(@Query() filterDto: FilterOrderDto) {
    return this.ordersService.findAll(filterDto);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.ORDERS.FETCH_USER_SUCCESS)
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() filterDto: FilterOrderDto,
  ) {
    return this.ordersService.findByUser(userId, filterDto);
  }

  @Get('vendor/:vendorId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.ORDERS.FETCH_VENDOR_SUCCESS)
  findByVendor(@Param('vendorId', ParseIntPipe) vendorId: number) {
    return this.ordersService.findByVendor(vendorId);
  }

  @Get('number/:orderNumber')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.ORDERS.FETCH_NUMBER_SUCCESS)
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.ORDERS.FETCH_ONE_SUCCESS)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.ORDERS.UPDATE_STATUS_SUCCESS)
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, dto);
  }
}
