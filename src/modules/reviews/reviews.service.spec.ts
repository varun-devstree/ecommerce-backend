import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ReviewsService', () => {
  let service: ReviewsService;

  const mockReviewRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReview', () => {
    it('should create review and recalculate product rating', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockProductRepository.findOne.mockResolvedValue({ id: 10 });
      mockReviewRepository.findOne.mockResolvedValueOnce(null); // uniqueness check

      const dto = {
        user_id: 1,
        product_id: 10,
        rating: 5,
        title: 'Awesome Phone',
        comment: 'Very fast!',
      };

      const reviewObj = { id: 50, ...dto, status: 'active' };
      mockReviewRepository.create.mockReturnValue(reviewObj);
      mockReviewRepository.save.mockResolvedValue(reviewObj);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest
          .fn()
          .mockResolvedValue({ avgRating: '5.0', reviewCount: '1' }),
      };
      mockReviewRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockReviewRepository.findOne.mockResolvedValueOnce(reviewObj);

      const res = await service.createReview(dto);

      expect(res).toBeDefined();
      expect(mockProductRepository.update).toHaveBeenCalledWith(10, {
        rating: 5,
        review_count: 1,
      });
    });

    it('should throw ConflictException if user already reviewed the product', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockProductRepository.findOne.mockResolvedValue({ id: 10 });
      mockReviewRepository.findOne.mockResolvedValue({ id: 50 });

      await expect(
        service.createReview({
          user_id: 1,
          product_id: 10,
          rating: 4,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
