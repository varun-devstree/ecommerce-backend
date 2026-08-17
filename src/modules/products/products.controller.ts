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

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // --- PRODUCT ENDPOINTS ---
  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Products fetched successfully')
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product details fetched successfully')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Product created successfully')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product updated successfully')
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
  @ResponseMessage('Product deleted successfully')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeProduct(id);
  }

  // --- PRODUCT VARIANTS ENDPOINTS ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':productId/variants')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Product variant created successfully')
  createVariant(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.productsService.createVariant(productId, dto);
  }

  @Get(':productId/variants')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product variants fetched successfully')
  findVariantsByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.productsService.findVariantsByProduct(productId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('variants/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product variant updated successfully')
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
  @ResponseMessage('Product variant deleted successfully')
  removeVariant(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeVariant(id);
  }

  // --- PRODUCT ATTRIBUTES ENDPOINTS ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':productId/attributes')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Product attribute created successfully')
  createAttribute(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateProductAttributeDto,
  ) {
    return this.productsService.createAttribute(productId, dto);
  }

  @Get(':productId/attributes')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product attributes fetched successfully')
  findAttributesByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.productsService.findAttributesByProduct(productId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('attributes/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product attribute updated successfully')
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
  @ResponseMessage('Product attribute deleted successfully')
  removeAttribute(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeAttribute(id);
  }

  // --- PRODUCT IMAGES ENDPOINTS ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':productId/images')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Product image created successfully')
  createImage(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateProductImageDto,
  ) {
    return this.productsService.createImage(productId, dto);
  }

  @Get(':productId/images')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product images fetched successfully')
  findImagesByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.productsService.findImagesByProduct(productId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('images/:id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product image updated successfully')
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
  @ResponseMessage('Product image deleted successfully')
  removeImage(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeImage(id);
  }
}
