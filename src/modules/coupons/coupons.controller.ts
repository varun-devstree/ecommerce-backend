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
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { RecordCouponUsageDto } from './dto/record-coupon-usage.dto';
import { FilterCouponDto } from './dto/filter-coupon.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(RESPONSE_MESSAGES.COUPONS.CREATE_SUCCESS)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.createCoupon(dto);
  }

  @Post('apply')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.COUPONS.APPLY_SUCCESS)
  validateAndApplyCoupon(@Body() dto: ApplyCouponDto) {
    return this.couponsService.validateAndApplyCoupon(dto);
  }

  @Post('record-usage')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.COUPONS.RECORD_USAGE_SUCCESS)
  recordUsage(@Body() dto: RecordCouponUsageDto) {
    return this.couponsService.recordUsage(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.COUPONS.FETCH_ALL_SUCCESS)
  findAll(@Query() filterDto: FilterCouponDto) {
    return this.couponsService.findAll(filterDto);
  }

  @Get('code/:code')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.COUPONS.FETCH_CODE_SUCCESS)
  findByCode(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  @Get('usages/coupon/:couponId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.COUPONS.FETCH_USAGES_COUPON_SUCCESS)
  getUsagesByCoupon(@Param('couponId', ParseIntPipe) couponId: number) {
    return this.couponsService.getUsagesByCoupon(couponId);
  }

  @Get('usages/user/:userId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.COUPONS.FETCH_USAGES_USER_SUCCESS)
  getUsagesByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.couponsService.getUsagesByUser(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.COUPONS.FETCH_ONE_SUCCESS)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.COUPONS.UPDATE_SUCCESS)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.COUPONS.DELETE_SUCCESS)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.remove(id);
  }
}
