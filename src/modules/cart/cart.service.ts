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
import { Address } from '../location/entities/address.entity';
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
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly inventoryService: InventoryService,
  ) {}

  async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user_id: userId },
      relations: {
        address: { country: true, state: true, city: true },
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
    addressId?: number,
  ): Promise<
    Cart & {
      subtotal: number;
      total_mrp: number;
      tax_amount: number;
      shipping_amount: number;
      total_price: number;
      approximate_delivery_date: string | null;
      total_items: number;
    }
  > {
    let cart = await this.getOrCreateCart(userId);

    if (addressId && cart.address_id !== addressId) {
      const address = await this.addressRepository.findOne({
        where: { id: addressId, user_id: userId },
        relations: { country: true, state: true, city: true },
      });
      if (!address) {
        throw new NotFoundException(
          `Address with ID ${addressId} not found for user ${userId}`,
        );
      }
      cart.address_id = addressId;
      cart.address = address;
      await this.cartRepository.save(cart);
    }

    let subtotal = 0;
    let total_mrp = 0;
    let total_items = 0;

    if (cart.items && cart.items.length > 0) {
      for (const item of cart.items) {
        const itemPrice = Number(item.price);
        const itemMrp =
          item.vendor_product?.mrp && Number(item.vendor_product.mrp) > 0
            ? Number(item.vendor_product.mrp)
            : itemPrice;

        subtotal += itemPrice * item.quantity;
        total_mrp += itemMrp * item.quantity;
        total_items += item.quantity;
      }
    }

    subtotal = Math.round(subtotal * 100) / 100;
    total_mrp = Math.round(total_mrp * 100) / 100;

    // Static tax 10% of MRP
    const tax_amount = Math.round(total_mrp * 0.10 * 100) / 100;

    // Shipping amount calculation (flat 50 if subtotal > 0 and subtotal < 1000, 0 if subtotal >= 1000 or 0 items)
    const shipping_amount =
      total_items > 0 ? (subtotal >= 1000 ? 0 : 50) : 0;

    const total_price =
      Math.round((subtotal + tax_amount + shipping_amount) * 100) / 100;

    // Approximate delivery date calculation (current date + 5 days)
    let approximate_delivery_date: string | null = null;
    if (total_items > 0) {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 5);
      approximate_delivery_date = deliveryDate.toISOString().split('T')[0];
    }

    return {
      ...cart,
      subtotal,
      total_mrp,
      tax_amount,
      shipping_amount,
      total_price,
      approximate_delivery_date,
      total_items,
    };
  }

  async addToCart(
    dto: AddToCartDto,
  ): Promise<
    Cart & {
      subtotal: number;
      total_mrp: number;
      tax_amount: number;
      shipping_amount: number;
      total_price: number;
      approximate_delivery_date: string | null;
      total_items: number;
    }
  > {
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

    if (dto.address_id) {
      const address = await this.addressRepository.findOne({
        where: { id: dto.address_id, user_id: dto.user_id },
      });
      if (!address) {
        throw new NotFoundException(
          `Address with ID ${dto.address_id} not found for user ${dto.user_id}`,
        );
      }
    }

    const inventory = await this.inventoryService.findByVendorProduct(
      dto.vendor_product_id,
    );

    const cart = await this.getOrCreateCart(dto.user_id);

    if (dto.address_id) {
      cart.address_id = dto.address_id;
      await this.cartRepository.save(cart);
    }

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

    return this.getCartByUserId(dto.user_id, dto.address_id);
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

