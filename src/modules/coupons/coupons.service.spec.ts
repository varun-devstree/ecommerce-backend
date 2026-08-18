import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CouponsService } from './coupons.service';
import { Coupon } from './entities/coupon.entity';
import { CouponUsage } from './entities/coupon-usage.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('CouponsService', () => {
  let service: CouponsService;

  const mockCouponRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockCouponUsageRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockOrderRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        {
          provide: getRepositoryToken(Coupon),
          useValue: mockCouponRepository,
        },
        {
          provide: getRepositoryToken(CouponUsage),
          useValue: mockCouponUsageRepository,
        },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCoupon', () => {
    it('should create coupon code', async () => {
      mockCouponRepository.findOne.mockResolvedValue(null);

      const dto = {
        code: 'SAVE10',
        discount_type: 'percentage',
        discount_value: 10,
        start_date: '2026-01-01',
        end_date: '2026-12-31',
      };

      const couponObj = { id: 1, ...dto, code: 'SAVE10', status: 'active' };
      mockCouponRepository.create.mockReturnValue(couponObj);
      mockCouponRepository.save.mockResolvedValue(couponObj);

      const res = await service.createCoupon(dto);
      expect(res.code).toBe('SAVE10');
    });

    it('should throw ConflictException if coupon code exists', async () => {
      mockCouponRepository.findOne.mockResolvedValue({ id: 1, code: 'SAVE10' });

      await expect(
        service.createCoupon({
          code: 'SAVE10',
          discount_type: 'fixed',
          discount_value: 100,
          start_date: '2026-01-01',
          end_date: '2026-12-31',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('validateAndApplyCoupon', () => {
    it('should calculate percentage discount capped at maximum_discount', async () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 86400000);
      const endDate = new Date(now.getTime() + 86400000);

      const couponObj = {
        id: 1,
        code: 'SUMMER20',
        discount_type: 'percentage',
        discount_value: 20,
        maximum_discount: 50,
        minimum_order_value: 100,
        status: 'active',
        start_date: startDate,
        end_date: endDate,
      };

      mockCouponRepository.findOne.mockResolvedValue(couponObj);

      const res = await service.validateAndApplyCoupon({
        code: 'SUMMER20',
        user_id: 1,
        order_subtotal: 500, // 20% of 500 = 100, capped at max 50
      });

      expect(res.discount_amount).toBe(50);
    });

    it('should throw BadRequestException if order subtotal is below minimum order value', async () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 86400000);
      const endDate = new Date(now.getTime() + 86400000);

      mockCouponRepository.findOne.mockResolvedValue({
        id: 1,
        code: 'MIN100',
        minimum_order_value: 100,
        status: 'active',
        start_date: startDate,
        end_date: endDate,
      });

      await expect(
        service.validateAndApplyCoupon({
          code: 'MIN100',
          user_id: 1,
          order_subtotal: 50,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
