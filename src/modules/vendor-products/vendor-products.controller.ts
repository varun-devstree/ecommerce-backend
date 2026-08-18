import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VendorProductsService } from './vendor-products.service';
import { CreateVendorProductDto } from './dto/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/update-vendor-product.dto';
import { FilterVendorProductDto } from './dto/filter-vendor-product.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { RESPONSE_MESSAGES } from '../../common/constants';

@Controller('vendor-products')
export class VendorProductsController {
  constructor(private readonly vendorProductsService: VendorProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(RESPONSE_MESSAGES.VENDOR_PRODUCTS.CREATE_SUCCESS)
  create(@Body() dto: CreateVendorProductDto) {
    return this.vendorProductsService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.VENDOR_PRODUCTS.FETCH_ALL_SUCCESS)
  findAll(@Query() filterDto: FilterVendorProductDto) {
    return this.vendorProductsService.findAll(filterDto);
  }

  @Get('vendor/:vendorId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.VENDOR_PRODUCTS.FETCH_VENDOR_SUCCESS)
  findByVendor(@Param('vendorId', ParseIntPipe) vendorId: number) {
    return this.vendorProductsService.findByVendor(vendorId);
  }

  @Get('variant/:variantId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.VENDOR_PRODUCTS.FETCH_VARIANT_SUCCESS)
  findByVariant(@Param('variantId', ParseIntPipe) variantId: number) {
    return this.vendorProductsService.findByVariant(variantId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.VENDOR_PRODUCTS.FETCH_ONE_SUCCESS)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vendorProductsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.VENDOR_PRODUCTS.UPDATE_SUCCESS)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVendorProductDto,
  ) {
    return this.vendorProductsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.VENDOR_PRODUCTS.DELETE_SUCCESS)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vendorProductsService.remove(id);
  }
}
