import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderAddress } from './entities/order-address.entity';
import { OrderVendor } from './entities/order-vendor.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { User } from '../users/entities/user.entity';
import { VendorProduct } from '../vendor-products/entities/vendor-product.entity';
import { Address } from '../location/entities/address.entity';
import { InventoryService } from '../inventory/inventory.service';
import { CartService } from '../cart/cart.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockOrderRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockOrderAddressRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockOrderVendorRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockOrderItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockOrderStatusHistoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
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
    reserveInventory: jest.fn(),
    releaseInventory: jest.fn(),
    deductInventory: jest.fn(),
  };

  const mockCartService = {
    getCartByUserId: jest.fn(),
    clearCart: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        {
          provide: getRepositoryToken(OrderAddress),
          useValue: mockOrderAddressRepository,
        },
        {
          provide: getRepositoryToken(OrderVendor),
          useValue: mockOrderVendorRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrderItemRepository,
        },
        {
          provide: getRepositoryToken(OrderStatusHistory),
          useValue: mockOrderStatusHistoryRepository,
        },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(VendorProduct),
          useValue: mockVendorProductRepository,
        },
        {
          provide: getRepositoryToken(Address),
          useValue: mockAddressRepository,
        },
        { provide: InventoryService, useValue: mockInventoryService },
        { provide: CartService, useValue: mockCartService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create order, snapshot address, split multi-vendor items, and reserve stock', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1, name: 'John' });
      mockVendorProductRepository.findOne.mockResolvedValue({
        id: 10,
        vendor_id: 100,
        selling_price: 50,
        status: 'active',
        product_variant: {
          sku: 'SKU50',
          product: { name: 'Item Alpha' },
        },
      });
      mockInventoryService.findByVendorProduct.mockResolvedValue({
        available_quantity: 20,
      });

      const orderObj = { id: 1, order_number: 'ORD-123', subtotal: 100 };
      mockOrderRepository.create.mockReturnValue(orderObj);
      mockOrderRepository.save.mockResolvedValue(orderObj);

      mockOrderAddressRepository.create.mockImplementation((val) => val);
      mockOrderAddressRepository.save.mockResolvedValue({ id: 1 });

      mockOrderVendorRepository.create.mockImplementation((val) => val);
      mockOrderVendorRepository.save.mockResolvedValue({ id: 1 });

      mockOrderItemRepository.create.mockImplementation((val) => val);
      mockOrderItemRepository.save.mockResolvedValue({ id: 1 });

      mockOrderStatusHistoryRepository.create.mockImplementation((val) => val);
      mockOrderStatusHistoryRepository.save.mockResolvedValue({ id: 1 });

      mockOrderRepository.findOne.mockResolvedValue(orderObj);

      const result = await service.createOrder({
        user_id: 1,
        address: {
          name: 'John Doe',
          mobile_number: '1234567890',
          address_line_1: 'Street 1',
          country: 'USA',
          state: 'NY',
          city: 'NYC',
          postal_code: '10001',
        },
        items: [{ vendor_product_id: 10, quantity: 2 }],
      });

      expect(result).toBeDefined();
      expect(mockInventoryService.reserveInventory).toHaveBeenCalledWith({
        vendor_product_id: 10,
        quantity: 2,
        reference_type: 'ORDER',
        reference_id: 1,
      });
    });
  });

  describe('updateOrderStatus', () => {
    it('should release inventory when order status changes to cancelled', async () => {
      const orderObj = {
        id: 1,
        order_status: 'placed',
        items: [{ vendor_product_id: 10, quantity: 2 }],
        order_vendors: [],
      };

      mockOrderRepository.findOne.mockResolvedValue(orderObj);
      mockOrderRepository.save.mockResolvedValue({ ...orderObj, order_status: 'cancelled' });
      mockOrderStatusHistoryRepository.create.mockImplementation((val) => val);

      await service.updateOrderStatus(1, {
        status: 'cancelled',
        description: 'User cancelled order',
      });

      expect(mockInventoryService.releaseInventory).toHaveBeenCalledWith({
        vendor_product_id: 10,
        quantity: 2,
        reference_type: 'ORDER_CANCELLED',
        reference_id: 1,
      });
    });

    it('should deduct inventory when order status changes to shipped', async () => {
      const orderObj = {
        id: 1,
        order_status: 'placed',
        items: [{ vendor_product_id: 10, quantity: 2 }],
        order_vendors: [],
      };

      mockOrderRepository.findOne.mockResolvedValue(orderObj);
      mockOrderRepository.save.mockResolvedValue({ ...orderObj, order_status: 'shipped' });
      mockOrderStatusHistoryRepository.create.mockImplementation((val) => val);

      await service.updateOrderStatus(1, {
        status: 'shipped',
        description: 'Order shipped via FedEx',
      });

      expect(mockInventoryService.deductInventory).toHaveBeenCalledWith({
        vendor_product_id: 10,
        quantity: 2,
        from_reserved: true,
        reference_type: 'ORDER_FULFILLED',
        reference_id: 1,
      });
    });
  });
});
