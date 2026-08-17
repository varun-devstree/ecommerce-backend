import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { User } from '../users/entities/user.entity';
import { VendorProduct } from '../vendor-products/entities/vendor-product.entity';
import { InventoryService } from '../inventory/inventory.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(VendorProduct)
    private readonly vendorProductRepository: Repository<VendorProduct>,
    private readonly inventoryService: InventoryService,
  ) {}

  async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user_id: userId },
      relations: {
        items: {
          vendor_product: {
            product_variant: { product: true },
            vendor: true,
          },
        },
      },
    });

    if (!cart) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const newCart = this.cartRepository.create({
        user_id: userId,
      });
      cart = await this.cartRepository.save(newCart);
      cart.items = [];
    }

    return cart;
  }

  async getCartByUserId(
    userId: number,
  ): Promise<Cart & { subtotal: number; total_items: number }> {
    const cart = await this.getOrCreateCart(userId);

    let subtotal = 0;
    let total_items = 0;

    if (cart.items && cart.items.length > 0) {
      for (const item of cart.items) {
        const itemPrice = Number(item.price);
        subtotal += itemPrice * item.quantity;
        total_items += item.quantity;
      }
    }

    return {
      ...cart,
      subtotal: Math.round(subtotal * 100) / 100,
      total_items,
    };
  }

  async addToCart(dto: AddToCartDto): Promise<Cart & { subtotal: number; total_items: number }> {
    const vendorProduct = await this.vendorProductRepository.findOne({
      where: { id: dto.vendor_product_id },
    });

    if (!vendorProduct) {
      throw new NotFoundException(
        `Vendor product with ID ${dto.vendor_product_id} not found`,
      );
    }

    if (vendorProduct.status !== 'active') {
      throw new BadRequestException(
        `Vendor product ${dto.vendor_product_id} is not active`,
      );
    }

    const inventory = await this.inventoryService.findByVendorProduct(
      dto.vendor_product_id,
    );

    const cart = await this.getOrCreateCart(dto.user_id);

    let cartItem = await this.cartItemRepository.findOne({
      where: {
        cart_id: cart.id,
        vendor_product_id: dto.vendor_product_id,
      },
    });

    const newQuantity = cartItem
      ? cartItem.quantity + dto.quantity
      : dto.quantity;

    if (inventory.available_quantity < newQuantity) {
      throw new BadRequestException(
        `Insufficient available inventory. Available: ${inventory.available_quantity}, Requested in cart: ${newQuantity}`,
      );
    }

    if (cartItem) {
      cartItem.quantity = newQuantity;
      cartItem.price = vendorProduct.selling_price;
      await this.cartItemRepository.save(cartItem);
    } else {
      cartItem = this.cartItemRepository.create({
        cart_id: cart.id,
        vendor_product_id: dto.vendor_product_id,
        quantity: dto.quantity,
        price: vendorProduct.selling_price,
      });
      await this.cartItemRepository.save(cartItem);
    }

    return this.getCartByUserId(dto.user_id);
  }

  async updateCartItem(
    itemId: number,
    dto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: { cart: true, vendor_product: true },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }

    const inventory = await this.inventoryService.findByVendorProduct(
      cartItem.vendor_product_id,
    );

    if (inventory.available_quantity < dto.quantity) {
      throw new BadRequestException(
        `Insufficient available inventory. Available: ${inventory.available_quantity}, Requested: ${dto.quantity}`,
      );
    }

    cartItem.quantity = dto.quantity;
    if (cartItem.vendor_product) {
      cartItem.price = cartItem.vendor_product.selling_price;
    }

    return this.cartItemRepository.save(cartItem);
  }

  async removeCartItem(itemId: number): Promise<{ message: string }> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }

    await this.cartItemRepository.remove(cartItem);
    return { message: `Cart item ${itemId} successfully removed` };
  }

  async clearCart(userId: number): Promise<{ message: string }> {
    const cart = await this.cartRepository.findOne({
      where: { user_id: userId },
      relations: { items: true },
    });

    if (cart && cart.items && cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
    }

    return { message: `Cart for user ${userId} successfully cleared` };
  }
}
