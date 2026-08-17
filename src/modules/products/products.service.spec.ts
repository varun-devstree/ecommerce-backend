import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductImage } from './entities/product-image.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProductRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockBrandRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockVariantRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockAttributeRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockImageRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepository },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepository },
        { provide: getRepositoryToken(Brand), useValue: mockBrandRepository },
        { provide: getRepositoryToken(ProductVariant), useValue: mockVariantRepository },
        { provide: getRepositoryToken(ProductAttribute), useValue: mockAttributeRepository },
        { provide: getRepositoryToken(ProductImage), useValue: mockImageRepository },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create product with nested variants, attributes, and images', async () => {
      mockCategoryRepository.findOne.mockResolvedValue({ id: 1, name: 'Electronics' });
      mockProductRepository.findOne.mockResolvedValueOnce(null); // slug check

      const dto = {
        category_id: 1,
        name: 'Smartphone X',
        variants: [{ sku: 'SMX-BLK', variant_name: 'Black' }],
        attributes: [{ attribute_name: 'Color', attribute_value: 'Black' }],
        images: [{ image_url: 'http://img.com/1.png', sort_order: 1 }],
      };

      mockProductRepository.create.mockReturnValue({ ...dto, slug: 'smartphone-x' });
      mockProductRepository.save.mockResolvedValue({ id: 10, ...dto, slug: 'smartphone-x' });
      mockVariantRepository.create.mockImplementation((val) => val);
      mockVariantRepository.save.mockResolvedValue([]);
      mockAttributeRepository.create.mockImplementation((val) => val);
      mockAttributeRepository.save.mockResolvedValue([]);
      mockImageRepository.create.mockImplementation((val) => val);
      mockImageRepository.save.mockResolvedValue([]);

      mockProductRepository.findOne.mockResolvedValueOnce({ id: 10, ...dto, slug: 'smartphone-x' });

      const result = await service.createProduct(dto);
      expect(result).toBeDefined();
      expect(mockVariantRepository.save).toHaveBeenCalled();
      expect(mockAttributeRepository.save).toHaveBeenCalled();
      expect(mockImageRepository.save).toHaveBeenCalled();
    });
  });

  describe('createVariant', () => {
    it('should create variant for product', async () => {
      mockProductRepository.findOne.mockResolvedValue({ id: 1, name: 'Product 1' });
      mockVariantRepository.findOne.mockResolvedValue(null);
      mockVariantRepository.create.mockReturnValue({ id: 5, sku: 'SKU123', product_id: 1 });
      mockVariantRepository.save.mockResolvedValue({ id: 5, sku: 'SKU123', product_id: 1 });

      const res = await service.createVariant(1, { sku: 'SKU123' });
      expect(res.sku).toBe('SKU123');
    });

    it('should throw error if SKU already exists', async () => {
      mockProductRepository.findOne.mockResolvedValue({ id: 1, name: 'Product 1' });
      mockVariantRepository.findOne.mockResolvedValue({ id: 2, sku: 'SKU123' });

      await expect(service.createVariant(1, { sku: 'SKU123' })).rejects.toThrow(BadRequestException);
    });
  });
});
