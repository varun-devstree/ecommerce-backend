import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VendorProductsService } from './vendor-products.service';
import { VendorProduct } from './entities/vendor-product.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { InventoryService } from '../inventory/inventory.service';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

describe('VendorProductsService', () => {
  let service: VendorProductsService;

  const mockVendorProductRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockVendorRepository = {
    findOne: jest.fn(),
  };

  const mockProductVariantRepository = {
    findOne: jest.fn(),
  };

  const mockInventoryService = {
    createInitialInventory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorProductsService,
        {
          provide: getRepositoryToken(VendorProduct),
          useValue: mockVendorProductRepository,
        },
        {
          provide: getRepositoryToken(Vendor),
          useValue: mockVendorRepository,
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useValue: mockProductVariantRepository,
        },
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
      ],
    }).compile();

    service = module.get<VendorProductsService>(VendorProductsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create vendor product and initialize inventory', async () => {
      mockVendorRepository.findOne.mockResolvedValue({ id: 1, name: 'Vendor 1' });
      mockProductVariantRepository.findOne.mockResolvedValue({
        id: 2,
        sku: 'SKU1',
      });
      mockVendorProductRepository.findOne.mockResolvedValueOnce(null); // uniqueness check

      const dto = {
        vendor_id: 1,
        product_variant_id: 2,
        selling_price: 100,
        mrp: 150,
        initial_quantity: 25,
      };

      const vpObj = { id: 10, ...dto, status: 'active' };
      mockVendorProductRepository.create.mockReturnValue(vpObj);
      mockVendorProductRepository.save.mockResolvedValue(vpObj);

      mockVendorProductRepository.findOne.mockResolvedValueOnce(vpObj); // findOne lookup after save

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(mockInventoryService.createInitialInventory).toHaveBeenCalledWith(
        10,
        25,
      );
    });

    it('should throw NotFoundException if vendor does not exist', async () => {
      mockVendorRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          vendor_id: 999,
          product_variant_id: 1,
          selling_price: 100,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if product variant does not exist', async () => {
      mockVendorRepository.findOne.mockResolvedValue({ id: 1 });
      mockProductVariantRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          vendor_id: 1,
          product_variant_id: 999,
          selling_price: 100,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if MRP is less than selling price', async () => {
      mockVendorRepository.findOne.mockResolvedValue({ id: 1 });
      mockProductVariantRepository.findOne.mockResolvedValue({ id: 2 });

      await expect(
        service.create({
          vendor_id: 1,
          product_variant_id: 2,
          selling_price: 200,
          mrp: 150,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if vendor product already exists', async () => {
      mockVendorRepository.findOne.mockResolvedValue({ id: 1 });
      mockProductVariantRepository.findOne.mockResolvedValue({ id: 2 });
      mockVendorProductRepository.findOne.mockResolvedValue({
        id: 5,
        vendor_id: 1,
        product_variant_id: 2,
      });

      await expect(
        service.create({
          vendor_id: 1,
          product_variant_id: 2,
          selling_price: 100,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return vendor product by ID', async () => {
      const vp = { id: 10, vendor_id: 1, product_variant_id: 2 };
      mockVendorProductRepository.findOne.mockResolvedValue(vp);

      const res = await service.findOne(10);
      expect(res).toEqual(vp);
    });

    it('should throw NotFoundException if vendor product not found', async () => {
      mockVendorProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update selling price and mrp', async () => {
      const existing = {
        id: 10,
        selling_price: 100,
        mrp: 150,
        status: 'active',
      };
      mockVendorProductRepository.findOne.mockResolvedValue(existing);
      mockVendorProductRepository.save.mockResolvedValue({
        ...existing,
        selling_price: 120,
      });

      const res = await service.update(10, { selling_price: 120 });
      expect(res).toBeDefined();
      expect(mockVendorProductRepository.save).toHaveBeenCalled();
    });
  });
});
