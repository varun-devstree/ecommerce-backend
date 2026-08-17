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
} from '@nestjs/common';
import { VendorProductsService } from './vendor-products.service';
import { CreateVendorProductDto } from './dto/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/update-vendor-product.dto';
import { FilterVendorProductDto } from './dto/filter-vendor-product.dto';

@Controller('vendor-products')
export class VendorProductsController {
  constructor(private readonly vendorProductsService: VendorProductsService) {}

  @Post()
  create(@Body() dto: CreateVendorProductDto) {
    return this.vendorProductsService.create(dto);
  }

  @Get()
  findAll(@Query() filterDto: FilterVendorProductDto) {
    return this.vendorProductsService.findAll(filterDto);
  }

  @Get('vendor/:vendorId')
  findByVendor(@Param('vendorId', ParseIntPipe) vendorId: number) {
    return this.vendorProductsService.findByVendor(vendorId);
  }

  @Get('variant/:variantId')
  findByVariant(@Param('variantId', ParseIntPipe) variantId: number) {
    return this.vendorProductsService.findByVariant(variantId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vendorProductsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVendorProductDto,
  ) {
    return this.vendorProductsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vendorProductsService.remove(id);
  }
}
