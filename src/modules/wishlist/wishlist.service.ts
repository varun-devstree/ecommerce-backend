import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(WishlistItem)
    private readonly wishlistItemRepository: Repository<WishlistItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getOrCreateWishlist(userId: number): Promise<Wishlist> {
    let wishlist = await this.wishlistRepository.findOne({
      where: { user_id: userId },
      relations: {
        items: {
          product: { category: true, brand: true },
        },
      },
    });

    if (!wishlist) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const newWishlist = this.wishlistRepository.create({
        user_id: userId,
      });
      wishlist = await this.wishlistRepository.save(newWishlist);
      wishlist.items = [];
    }

    return wishlist;
  }

  async getWishlistByUserId(userId: number): Promise<Wishlist> {
    return this.getOrCreateWishlist(userId);
  }

  async addToWishlist(dto: AddToWishlistDto): Promise<Wishlist> {
    const product = await this.productRepository.findOne({
      where: { id: dto.product_id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${dto.product_id} not found`);
    }

    const wishlist = await this.getOrCreateWishlist(dto.user_id);

    const existingItem = await this.wishlistItemRepository.findOne({
      where: {
        wishlist_id: wishlist.id,
        product_id: dto.product_id,
      },
    });

    if (existingItem) {
      throw new ConflictException(
        `Product ${dto.product_id} is already in the wishlist`,
      );
    }

    const wishlistItem = this.wishlistItemRepository.create({
      wishlist_id: wishlist.id,
      product_id: dto.product_id,
    });

    await this.wishlistItemRepository.save(wishlistItem);
    return this.getWishlistByUserId(dto.user_id);
  }

  async removeWishlistItem(itemId: number): Promise<{ message: string }> {
    const item = await this.wishlistItemRepository.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException(`Wishlist item with ID ${itemId} not found`);
    }

    await this.wishlistItemRepository.remove(item);
    return { message: `Wishlist item ${itemId} successfully removed` };
  }
}
