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
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { RecordCouponUsageDto } from './dto/record-coupon-usage.dto';
import { FilterCouponDto } from './dto/filter-coupon.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Coupon created successfully')
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.createCoupon(dto);
  }

  @Post('apply')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Coupon validated and applied successfully')
  validateAndApplyCoupon(@Body() dto: ApplyCouponDto) {
    return this.couponsService.validateAndApplyCoupon(dto);
  }

  @Post('record-usage')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Coupon usage recorded successfully')
  recordUsage(@Body() dto: RecordCouponUsageDto) {
    return this.couponsService.recordUsage(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Coupons fetched successfully')
  findAll(@Query() filterDto: FilterCouponDto) {
    return this.couponsService.findAll(filterDto);
  }

  @Get('code/:code')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Coupon details fetched by code successfully')
  findByCode(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  @Get('usages/coupon/:couponId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Coupon usage history fetched successfully')
  getUsagesByCoupon(@Param('couponId', ParseIntPipe) couponId: number) {
    return this.couponsService.getUsagesByCoupon(couponId);
  }

  @Get('usages/user/:userId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User coupon usage history fetched successfully')
  getUsagesByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.couponsService.getUsagesByUser(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Coupon details fetched successfully')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Coupon updated successfully')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Coupon deleted successfully')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.remove(id);
  }
}
