import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

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

  findOne(id: number) {
    return this.productRepository.findOne({
      where: { id },
      relations: {
        category: true,
        brand: true,
        variants: true,
        images: true,
        attributes: true,
      },
    });
  }

  findAllCategories() {
    return this.categoryRepository.find({
      relations: { parent: true, children: true },
    });
  }

  findAllBrands() {
    return this.brandRepository.find();
  }
}
