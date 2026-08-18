import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { CreateProductAttributeDto } from './dto/create-product-attribute.dto';
import { UpdateProductAttributeDto } from './dto/update-product-attribute.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { RESPONSE_MESSAGES } from '../../common/constants';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // --- PRODUCT ENDPOINTS ---
  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCTS.FETCH_ALL_SUCCESS)
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCTS.FETCH_ONE_SUCCESS)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCTS.CREATE_SUCCESS)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCTS.UPDATE_SUCCESS)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCTS.DELETE_SUCCESS)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeProduct(id);
  }

  // --- PRODUCT VARIANTS ENDPOINTS ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':productId/variants')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCTS.CREATE_VARIANT_SUCCESS)
  createVariant(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.productsService.createVariant(productId, dto);
  }

  @Get(':productId/variants')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCTS.FETCH_VARIANTS_SUCCESS)
  findVariantsByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.productsService.findVariantsByProduct(productId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('variants/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCTS.UPDATE_VARIANT_SUCCESS)
  updateVariant(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.productsService.updateVariant(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('variants/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCTS.DELETE_VARIANT_SUCCESS)
  removeVariant(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeVariant(id);
  }

  // --- PRODUCT ATTRIBUTES ENDPOINTS ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':productId/attributes')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCTS.CREATE_ATTRIBUTE_SUCCESS)
  createAttribute(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateProductAttributeDto,
  ) {
    return this.productsService.createAttribute(productId, dto);
  }

  @Get(':productId/attributes')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCTS.FETCH_ATTRIBUTES_SUCCESS)
  findAttributesByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.productsService.findAttributesByProduct(productId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('attributes/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCTS.UPDATE_ATTRIBUTE_SUCCESS)
  updateAttribute(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductAttributeDto,
  ) {
    return this.productsService.updateAttribute(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('attributes/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCTS.DELETE_ATTRIBUTE_SUCCESS)
  removeAttribute(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeAttribute(id);
  }

  // --- PRODUCT IMAGES ENDPOINTS ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':productId/images')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCTS.CREATE_IMAGE_SUCCESS)
  createImage(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateProductImageDto,
  ) {
    return this.productsService.createImage(productId, dto);
  }

  @Get(':productId/images')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCTS.FETCH_IMAGES_SUCCESS)
  findImagesByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.productsService.findImagesByProduct(productId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('images/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCTS.UPDATE_IMAGE_SUCCESS)
  updateImage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductImageDto,
  ) {
    return this.productsService.updateImage(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('images/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.PRODUCTS.DELETE_IMAGE_SUCCESS)
  removeImage(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeImage(id);
  }
}
