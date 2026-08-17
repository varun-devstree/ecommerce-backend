import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) { }

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

    const product = this.productRepository.create({
      ...dto,
      slug,
    });
    return this.productRepository.save(product);
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
    return this.productRepository.save(product);
  }

  async removeProduct(id: number) {
    const product = await this.findOne(id);
    product.status = 'deleted';
    await this.productRepository.save(product);
    await this.productRepository.softRemove(product);
    return { message: `Product '${product.name}' soft deleted successfully` };
  }
}
