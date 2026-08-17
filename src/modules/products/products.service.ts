import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { CreateProductAttributeDto } from './dto/create-product-attribute.dto';
import { UpdateProductAttributeDto } from './dto/update-product-attribute.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductAttribute)
    private readonly attributeRepository: Repository<ProductAttribute>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
  ) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // --- CATEGORIES CRUD ---
  async createCategory(dto: CreateCategoryDto) {
    const slug = dto.slug || this.slugify(dto.name);
    const existing = await this.categoryRepository.findOne({ where: { slug } });
    if (existing) {
      throw new BadRequestException(`Category with slug '${slug}' already exists`);
    }
    const category = this.categoryRepository.create({
      ...dto,
      slug,
    });
    return this.categoryRepository.save(category);
  }

  findAllCategories() {
    return this.categoryRepository.find({
      relations: { parent: true, children: true },
    });
  }

  async findCategoryById(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: { parent: true, children: true },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    const category = await this.findCategoryById(id);
    if (dto.name && !dto.slug) {
      dto.slug = this.slugify(dto.name);
    }
    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async removeCategory(id: number) {
    const category = await this.findCategoryById(id);
    category.status = 'deleted';
    await this.categoryRepository.save(category);
    await this.categoryRepository.softRemove(category);
    return { message: `Category '${category.name}' deleted successfully` };
  }

  // --- BRANDS CRUD ---
  async createBrand(dto: CreateBrandDto) {
    const slug = dto.slug || this.slugify(dto.name);
    const existing = await this.brandRepository.findOne({ where: { slug } });
    if (existing) {
      throw new BadRequestException(`Brand with slug '${slug}' already exists`);
    }
    const brand = this.brandRepository.create({
      ...dto,
      slug,
    });
    return this.brandRepository.save(brand);
  }

  findAllBrands() {
    return this.brandRepository.find();
  }

  async findBrandById(id: number) {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return brand;
  }

  async updateBrand(id: number, dto: UpdateBrandDto) {
    const brand = await this.findBrandById(id);
    if (dto.name && !dto.slug) {
      dto.slug = this.slugify(dto.name);
    }
    Object.assign(brand, dto);
    return this.brandRepository.save(brand);
  }

  async removeBrand(id: number) {
    const brand = await this.findBrandById(id);
    brand.status = 'deleted';
    await this.brandRepository.save(brand);
    await this.brandRepository.softRemove(brand);
    return { message: `Brand '${brand.name}' soft deleted successfully` };
  }

  // --- PRODUCTS CRUD ---
  async createProduct(dto: CreateProductDto) {
    await this.findCategoryById(dto.category_id);
    if (dto.brand_id) {
      await this.findBrandById(dto.brand_id);
    }

    const slug = dto.slug || this.slugify(dto.name);
    const existing = await this.productRepository.findOne({ where: { slug } });
    if (existing) {
      throw new BadRequestException(`Product with slug '${slug}' already exists`);
    }

    const { variants, attributes, images, ...productData } = dto;

    const product = this.productRepository.create({
      ...productData,
      slug,
    });

    const savedProduct = await this.productRepository.save(product);

    if (variants && variants.length > 0) {
      const variantEntities = variants.map((v) =>
        this.variantRepository.create({ ...v, product_id: savedProduct.id }),
      );
      await this.variantRepository.save(variantEntities);
    }

    if (attributes && attributes.length > 0) {
      const attributeEntities = attributes.map((a) =>
        this.attributeRepository.create({ ...a, product_id: savedProduct.id }),
      );
      await this.attributeRepository.save(attributeEntities);
    }

    if (images && images.length > 0) {
      const imageEntities = images.map((i) =>
        this.imageRepository.create({ ...i, product_id: savedProduct.id }),
      );
      await this.imageRepository.save(imageEntities);
    }

    return this.findOne(savedProduct.id);
  }

  findAll() {
    return this.productRepository.find({
      relations: {
        category: true,
        brand: true,
        variants: true,
        images: true,
        attributes: true,
      },
    });
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        category: true,
        brand: true,
        variants: true,
        images: true,
        attributes: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    if (dto.category_id) {
      await this.findCategoryById(dto.category_id);
    }
    if (dto.brand_id) {
      await this.findBrandById(dto.brand_id);
    }
    if (dto.name && !dto.slug) {
      dto.slug = this.slugify(dto.name);
    }
    Object.assign(product, dto);
    await this.productRepository.save(product);
    return this.findOne(id);
  }

  async removeProduct(id: number) {
    const product = await this.findOne(id);
    product.status = 'deleted';
    await this.productRepository.save(product);
    await this.productRepository.softRemove(product);
    return { message: `Product '${product.name}' soft deleted successfully` };
  }

  // --- PRODUCT VARIANTS CRUD ---
  async createVariant(productId: number, dto: CreateProductVariantDto) {
    await this.findOne(productId);

    const existingSku = await this.variantRepository.findOne({
      where: { sku: dto.sku },
    });
    if (existingSku) {
      throw new BadRequestException(`Variant with SKU '${dto.sku}' already exists`);
    }

    const variant = this.variantRepository.create({
      ...dto,
      product_id: productId,
    });
    return this.variantRepository.save(variant);
  }

  async findVariantsByProduct(productId: number) {
    await this.findOne(productId);
    return this.variantRepository.find({ where: { product_id: productId } });
  }

  async findVariantById(id: number) {
    const variant = await this.variantRepository.findOne({ where: { id } });
    if (!variant) {
      throw new NotFoundException(`Product variant with ID ${id} not found`);
    }
    return variant;
  }

  async updateVariant(id: number, dto: UpdateProductVariantDto) {
    const variant = await this.findVariantById(id);
    if (dto.sku && dto.sku !== variant.sku) {
      const existingSku = await this.variantRepository.findOne({
        where: { sku: dto.sku },
      });
      if (existingSku) {
        throw new BadRequestException(`Variant with SKU '${dto.sku}' already exists`);
      }
    }
    Object.assign(variant, dto);
    return this.variantRepository.save(variant);
  }

  async removeVariant(id: number) {
    const variant = await this.findVariantById(id);
    await this.variantRepository.remove(variant);
    return { message: `Variant with ID ${id} deleted successfully` };
  }

  // --- PRODUCT ATTRIBUTES CRUD ---
  async createAttribute(productId: number, dto: CreateProductAttributeDto) {
    await this.findOne(productId);
    const attribute = this.attributeRepository.create({
      ...dto,
      product_id: productId,
    });
    return this.attributeRepository.save(attribute);
  }

  async findAttributesByProduct(productId: number) {
    await this.findOne(productId);
    return this.attributeRepository.find({ where: { product_id: productId } });
  }

  async findAttributeById(id: number) {
    const attribute = await this.attributeRepository.findOne({ where: { id } });
    if (!attribute) {
      throw new NotFoundException(`Product attribute with ID ${id} not found`);
    }
    return attribute;
  }

  async updateAttribute(id: number, dto: UpdateProductAttributeDto) {
    const attribute = await this.findAttributeById(id);
    Object.assign(attribute, dto);
    return this.attributeRepository.save(attribute);
  }

  async removeAttribute(id: number) {
    const attribute = await this.findAttributeById(id);
    await this.attributeRepository.remove(attribute);
    return { message: `Attribute with ID ${id} deleted successfully` };
  }

  // --- PRODUCT IMAGES CRUD ---
  async createImage(productId: number, dto: CreateProductImageDto) {
    await this.findOne(productId);
    const image = this.imageRepository.create({
      ...dto,
      product_id: productId,
    });
    return this.imageRepository.save(image);
  }

  async findImagesByProduct(productId: number) {
    await this.findOne(productId);
    return this.imageRepository.find({
      where: { product_id: productId },
      order: { sort_order: 'ASC' },
    });
  }

  async findImageById(id: number) {
    const image = await this.imageRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Product image with ID ${id} not found`);
    }
    return image;
  }

  async updateImage(id: number, dto: UpdateProductImageDto) {
    const image = await this.findImageById(id);
    Object.assign(image, dto);
    return this.imageRepository.save(image);
  }

  async removeImage(id: number) {
    const image = await this.findImageById(id);
    await this.imageRepository.remove(image);
    return { message: `Image with ID ${id} deleted successfully` };
  }
}
