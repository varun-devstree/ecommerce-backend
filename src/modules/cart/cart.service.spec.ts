import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { User } from '../users/entities/user.entity';
import { VendorProduct } from '../vendor-products/entities/vendor-product.entity';
import { Address } from '../location/entities/address.entity';
import { InventoryService } from '../inventory/inventory.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;

  const mockCartRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCartItemRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockVendorProductRepository = {
    findOne: jest.fn(),
  };

  const mockAddressRepository = {
    findOne: jest.fn(),
  };

  const mockInventoryService = {
    findByVendorProduct: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useValue: mockCartRepository },
        { provide: getRepositoryToken(CartItem), useValue: mockCartItemRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(VendorProduct),
          useValue: mockVendorProductRepository,
        },
        { provide: getRepositoryToken(Address), useValue: mockAddressRepository },
        { provide: InventoryService, useValue: mockInventoryService },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCartByUserId', () => {
    it('should calculate subtotal, total_mrp, tax_amount (10% of MRP), shipping_amount, and approximate_delivery_date', async () => {
      const cartObj = {
        id: 1,
        user_id: 10,
        address_id: null,
        items: [
          {
            id: 101,
            price: 100,
            quantity: 2,
            vendor_product: { id: 1, mrp: 120, selling_price: 100 },
          },
          {
            id: 102,
            price: 50,
            quantity: 1,
            vendor_product: { id: 2, mrp: 60, selling_price: 50 },
          },
        ],
      };
      mockCartRepository.findOne.mockResolvedValue(cartObj);

      const res = await service.getCartByUserId(10);
      expect(res.subtotal).toBe(250);
      // Total MRP = (120*2) + (60*1) = 300
      expect(res.total_mrp).toBe(300);
      // Tax = 10% of 300 = 30
      expect(res.tax_amount).toBe(30);
      // Shipping = 50 (since subtotal 250 < 1000)
      expect(res.shipping_amount).toBe(50);
      // Total price = 250 + 30 + 50 = 330
      expect(res.total_price).toBe(330);
      expect(res.total_items).toBe(3);
      expect(res.approximate_delivery_date).toBeDefined();
    });
  });

  describe('addToCart', () => {
    it('should add new item to cart when inventory is available and address_id is valid', async () => {
      mockVendorProductRepository.findOne.mockResolvedValue({
        id: 1,
        selling_price: 100,
        mrp: 120,
        status: 'active',
      });
      mockAddressRepository.findOne.mockResolvedValue({
        id: 5,
        user_id: 10,
        name: 'Home Address',
      });
      mockInventoryService.findByVendorProduct.mockResolvedValue({
        available_quantity: 10,
      });

      const cartObj = { id: 5, user_id: 10, address_id: null, items: [] };
      mockCartRepository.findOne.mockResolvedValue(cartObj);
      mockCartItemRepository.findOne.mockResolvedValue(null);
      mockCartItemRepository.create.mockImplementation((val) => val);
      mockCartItemRepository.save.mockResolvedValue({ id: 1, ...cartObj });
      mockCartRepository.save.mockResolvedValue({ ...cartObj, address_id: 5 });

      const res = await service.addToCart({
        user_id: 10,
        vendor_product_id: 1,
        quantity: 2,
        address_id: 5,
      });

      expect(res).toBeDefined();
      expect(mockCartItemRepository.save).toHaveBeenCalled();
      expect(mockAddressRepository.findOne).toHaveBeenCalledWith({
        where: { id: 5, user_id: 10 },
      });
    });

    it('should throw BadRequestException if available stock is insufficient', async () => {
      mockVendorProductRepository.findOne.mockResolvedValue({
        id: 1,
        selling_price: 100,
        status: 'active',
      });
      mockInventoryService.findByVendorProduct.mockResolvedValue({
        available_quantity: 1,
      });

      mockCartRepository.findOne.mockResolvedValue({ id: 5, user_id: 10, items: [] });

      await expect(
        service.addToCart({
          user_id: 10,
          vendor_product_id: 1,
          quantity: 5,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

