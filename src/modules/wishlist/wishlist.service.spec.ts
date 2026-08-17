import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WishlistService } from './wishlist.service';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('WishlistService', () => {
  let service: WishlistService;

  const mockWishlistRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockWishlistItemRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: getRepositoryToken(Wishlist),
          useValue: mockWishlistRepository,
        },
        {
          provide: getRepositoryToken(WishlistItem),
          useValue: mockWishlistItemRepository,
        },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToWishlist', () => {
    it('should add product to user wishlist', async () => {
      mockProductRepository.findOne.mockResolvedValue({ id: 1, name: 'Phone' });
      const wishlistObj = { id: 2, user_id: 10, items: [] };
      mockWishlistRepository.findOne.mockResolvedValue(wishlistObj);
      mockWishlistItemRepository.findOne.mockResolvedValue(null);
      mockWishlistItemRepository.create.mockImplementation((val) => val);
      mockWishlistItemRepository.save.mockResolvedValue({ id: 100 });

      const res = await service.addToWishlist({ user_id: 10, product_id: 1 });
      expect(res).toBeDefined();
      expect(mockWishlistItemRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if product is already in wishlist', async () => {
      mockProductRepository.findOne.mockResolvedValue({ id: 1, name: 'Phone' });
      mockWishlistRepository.findOne.mockResolvedValue({ id: 2, user_id: 10 });
      mockWishlistItemRepository.findOne.mockResolvedValue({
        id: 100,
        wishlist_id: 2,
        product_id: 1,
      });

      await expect(
        service.addToWishlist({ user_id: 10, product_id: 1 }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addToWishlist({ user_id: 10, product_id: 999 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
