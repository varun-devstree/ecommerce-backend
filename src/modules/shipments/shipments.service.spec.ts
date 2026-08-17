import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShipmentsService } from './shipments.service';
import { Shipment } from './entities/shipment.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderVendor } from '../orders/entities/order-vendor.entity';
import { DeliveryAgent } from '../delivery-agents/entities/delivery-agent.entity';
import { OrdersService } from '../orders/orders.service';
import { NotFoundException } from '@nestjs/common';

describe('ShipmentsService', () => {
  let service: ShipmentsService;

  const mockShipmentRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockOrderRepository = {
    findOne: jest.fn(),
  };

  const mockOrderVendorRepository = {
    findOne: jest.fn(),
  };

  const mockDeliveryAgentRepository = {
    findOne: jest.fn(),
  };

  const mockOrdersService = {
    updateOrderStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        {
          provide: getRepositoryToken(Shipment),
          useValue: mockShipmentRepository,
        },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        {
          provide: getRepositoryToken(OrderVendor),
          useValue: mockOrderVendorRepository,
        },
        {
          provide: getRepositoryToken(DeliveryAgent),
          useValue: mockDeliveryAgentRepository,
        },
        { provide: OrdersService, useValue: mockOrdersService },
      ],
    }).compile();

    service = module.get<ShipmentsService>(ShipmentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createShipment', () => {
    it('should create shipment tracking record', async () => {
      mockOrderRepository.findOne.mockResolvedValue({ id: 1 });
      mockOrderVendorRepository.findOne.mockResolvedValue({
        id: 10,
        order_id: 1,
      });

      const dto = {
        order_id: 1,
        order_vendor_id: 10,
        carrier: 'FedEx',
      };

      const shipmentObj = { id: 100, ...dto, shipment_status: 'pending' };
      mockShipmentRepository.create.mockReturnValue(shipmentObj);
      mockShipmentRepository.save.mockResolvedValue(shipmentObj);
      mockShipmentRepository.findOne.mockResolvedValue(shipmentObj);

      const res = await service.createShipment(dto);
      expect(res).toBeDefined();
      expect(mockShipmentRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createShipment({ order_id: 999, order_vendor_id: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateShipmentStatus', () => {
    it('should update status and sync order status when delivered', async () => {
      const shipmentObj = {
        id: 100,
        order_id: 1,
        carrier: 'FedEx',
        shipment_status: 'in_transit',
      };
      mockShipmentRepository.findOne.mockResolvedValue(shipmentObj);
      mockShipmentRepository.save.mockResolvedValue({
        ...shipmentObj,
        shipment_status: 'delivered',
      });

      const res = await service.updateShipmentStatus(100, {
        shipment_status: 'delivered',
      });

      expect(res).toBeDefined();
      expect(mockOrdersService.updateOrderStatus).toHaveBeenCalledWith(1, {
        status: 'delivered',
        description: expect.any(String),
      });
    });
  });
});
