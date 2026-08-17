import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { User } from '../users/entities/user.entity';
import { VendorProduct } from '../vendor-products/entities/vendor-product.entity';
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
    it('should calculate subtotal and total_items correctly', async () => {
      const cartObj = {
        id: 1,
        user_id: 10,
        items: [
          { id: 101, price: 100, quantity: 2 },
          { id: 102, price: 50, quantity: 1 },
        ],
      };
      mockCartRepository.findOne.mockResolvedValue(cartObj);

      const res = await service.getCartByUserId(10);
      expect(res.subtotal).toBe(250);
      expect(res.total_items).toBe(3);
    });
  });

  describe('addToCart', () => {
    it('should add new item to cart when inventory is available', async () => {
      mockVendorProductRepository.findOne.mockResolvedValue({
        id: 1,
        selling_price: 100,
        status: 'active',
      });
      mockInventoryService.findByVendorProduct.mockResolvedValue({
        available_quantity: 10,
      });

      const cartObj = { id: 5, user_id: 10, items: [] };
      mockCartRepository.findOne.mockResolvedValue(cartObj);
      mockCartItemRepository.findOne.mockResolvedValue(null);
      mockCartItemRepository.create.mockImplementation((val) => val);
      mockCartItemRepository.save.mockResolvedValue({ id: 1, ...cartObj });

      const res = await service.addToCart({
        user_id: 10,
        vendor_product_id: 1,
        quantity: 2,
      });

      expect(res).toBeDefined();
      expect(mockCartItemRepository.save).toHaveBeenCalled();
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
