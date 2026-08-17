import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { Inventory } from './entities/inventory.entity';
import { InventoryHistory } from './entities/inventory-history.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('InventoryService', () => {
  let service: InventoryService;

  const mockInventoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockInventoryHistoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(Inventory),
          useValue: mockInventoryRepository,
        },
        {
          provide: getRepositoryToken(InventoryHistory),
          useValue: mockInventoryHistoryRepository,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInitialInventory', () => {
    it('should create initial inventory and log history when inventory does not exist', async () => {
      mockInventoryRepository.findOne.mockResolvedValue(null);
      const inventoryObj = {
        id: 1,
        vendor_product_id: 10,
        quantity: 50,
        reserved_quantity: 0,
        available_quantity: 50,
      };

      mockInventoryRepository.create.mockReturnValue(inventoryObj);
      mockInventoryRepository.save.mockResolvedValue(inventoryObj);
      mockInventoryHistoryRepository.create.mockImplementation((val) => val);
      mockInventoryHistoryRepository.save.mockResolvedValue({ id: 100 });

      const result = await service.createInitialInventory(10, 50);

      expect(result).toEqual(inventoryObj);
      expect(mockInventoryRepository.save).toHaveBeenCalled();
      expect(mockInventoryHistoryRepository.save).toHaveBeenCalled();
    });

    it('should return existing inventory if already created', async () => {
      const existingObj = { id: 1, vendor_product_id: 10, quantity: 50 };
      mockInventoryRepository.findOne.mockResolvedValue(existingObj);

      const result = await service.createInitialInventory(10, 50);
      expect(result).toEqual(existingObj);
      expect(mockInventoryRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findByVendorProduct', () => {
    it('should return inventory for given vendor_product_id', async () => {
      const inv = { id: 1, vendor_product_id: 10, quantity: 20 };
      mockInventoryRepository.findOne.mockResolvedValue(inv);

      const res = await service.findByVendorProduct(10);
      expect(res).toEqual(inv);
    });

    it('should throw NotFoundException if inventory does not exist', async () => {
      mockInventoryRepository.findOne.mockResolvedValue(null);
      await expect(service.findByVendorProduct(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('adjustInventory', () => {
    it('should increase quantity and available_quantity on restock', async () => {
      const inv = {
        id: 1,
        vendor_product_id: 10,
        quantity: 20,
        reserved_quantity: 5,
        available_quantity: 15,
      };
      mockInventoryRepository.findOne.mockResolvedValue(inv);
      mockInventoryRepository.save.mockImplementation((val) => Promise.resolve(val));
      mockInventoryHistoryRepository.create.mockImplementation((val) => val);
      mockInventoryHistoryRepository.save.mockResolvedValue({ id: 101 });

      const result = await service.adjustInventory({
        vendor_product_id: 10,
        quantity: 10,
        operation: 'RESTOCK',
      });

      expect(result.quantity).toBe(30);
      expect(result.available_quantity).toBe(25);
      expect(mockInventoryHistoryRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if adjustment causes negative quantity', async () => {
      const inv = {
        id: 1,
        vendor_product_id: 10,
        quantity: 5,
        reserved_quantity: 0,
        available_quantity: 5,
      };
      mockInventoryRepository.findOne.mockResolvedValue(inv);

      await expect(
        service.adjustInventory({
          vendor_product_id: 10,
          quantity: -10,
          operation: 'MANUAL_ADJUSTMENT',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reserveInventory', () => {
    it('should reserve stock when available quantity is sufficient', async () => {
      const inv = {
        id: 1,
        vendor_product_id: 10,
        quantity: 20,
        reserved_quantity: 2,
        available_quantity: 18,
      };
      mockInventoryRepository.findOne.mockResolvedValue(inv);
      mockInventoryRepository.save.mockImplementation((val) => Promise.resolve(val));
      mockInventoryHistoryRepository.create.mockImplementation((val) => val);
      mockInventoryHistoryRepository.save.mockResolvedValue({ id: 102 });

      const res = await service.reserveInventory({
        vendor_product_id: 10,
        quantity: 5,
      });

      expect(res.reserved_quantity).toBe(7);
      expect(res.available_quantity).toBe(13);
    });

    it('should throw BadRequestException if available quantity is insufficient', async () => {
      const inv = {
        id: 1,
        vendor_product_id: 10,
        quantity: 10,
        reserved_quantity: 8,
        available_quantity: 2,
      };
      mockInventoryRepository.findOne.mockResolvedValue(inv);

      await expect(
        service.reserveInventory({
          vendor_product_id: 10,
          quantity: 5,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('releaseInventory', () => {
    it('should release reserved stock', async () => {
      const inv = {
        id: 1,
        vendor_product_id: 10,
        quantity: 20,
        reserved_quantity: 5,
        available_quantity: 15,
      };
      mockInventoryRepository.findOne.mockResolvedValue(inv);
      mockInventoryRepository.save.mockImplementation((val) => Promise.resolve(val));
      mockInventoryHistoryRepository.create.mockImplementation((val) => val);
      mockInventoryHistoryRepository.save.mockResolvedValue({ id: 103 });

      const res = await service.releaseInventory({
        vendor_product_id: 10,
        quantity: 3,
      });

      expect(res.reserved_quantity).toBe(2);
      expect(res.available_quantity).toBe(18);
    });

    it('should throw BadRequestException if requested release exceeds reserved quantity', async () => {
      const inv = {
        id: 1,
        vendor_product_id: 10,
        quantity: 20,
        reserved_quantity: 2,
        available_quantity: 18,
      };
      mockInventoryRepository.findOne.mockResolvedValue(inv);

      await expect(
        service.releaseInventory({
          vendor_product_id: 10,
          quantity: 5,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deductInventory', () => {
    it('should deduct stock from reserved quantity', async () => {
      const inv = {
        id: 1,
        vendor_product_id: 10,
        quantity: 20,
        reserved_quantity: 5,
        available_quantity: 15,
      };
      mockInventoryRepository.findOne.mockResolvedValue(inv);
      mockInventoryRepository.save.mockImplementation((val) => Promise.resolve(val));
      mockInventoryHistoryRepository.create.mockImplementation((val) => val);
      mockInventoryHistoryRepository.save.mockResolvedValue({ id: 104 });

      const res = await service.deductInventory({
        vendor_product_id: 10,
        quantity: 5,
        from_reserved: true,
      });

      expect(res.quantity).toBe(15);
      expect(res.reserved_quantity).toBe(0);
      expect(res.available_quantity).toBe(15);
    });
  });
});
