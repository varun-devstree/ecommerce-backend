import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrderDto } from './dto/filter-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderAddress)
    private readonly orderAddressRepository: Repository<OrderAddress>,
    @InjectRepository(OrderVendor)
    private readonly orderVendorRepository: Repository<OrderVendor>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderStatusHistory)
    private readonly orderStatusHistoryRepository: Repository<OrderStatusHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(VendorProduct)
    private readonly vendorProductRepository: Repository<VendorProduct>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly inventoryService: InventoryService,
    private readonly cartService: CartService,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const user = await this.userRepository.findOne({
      where: { id: dto.user_id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.user_id} not found`);
    }

    // 1. Resolve delivery address snapshot
    let addressSnapshot: {
      name: string;
      mobile_number: string;
      address_line_1: string;
      address_line_2?: string;
      country: string;
      state: string;
      city: string;
      postal_code: string;
    };

    if (dto.address_id) {
      const addressEntity = await this.addressRepository.findOne({
        where: { id: dto.address_id, user_id: dto.user_id },
        relations: { country: true, state: true, city: true },
      });
      if (!addressEntity) {
        throw new NotFoundException(
          `Address with ID ${dto.address_id} not found for user ${dto.user_id}`,
        );
      }
      addressSnapshot = {
        name: addressEntity.name,
        mobile_number: addressEntity.mobile_number,
        address_line_1: addressEntity.address_line_1,
        address_line_2: addressEntity.address_line_2 || undefined,
        country: addressEntity.country ? addressEntity.country.name : 'Unknown',
        state: addressEntity.state ? addressEntity.state.name : 'Unknown',
        city: addressEntity.city ? addressEntity.city.name : 'Unknown',
        postal_code: addressEntity.postal_code,
      };
    } else if (dto.address) {
      addressSnapshot = dto.address;
    } else {
      throw new BadRequestException(
        'Either address_id or address object must be provided to place an order',
      );
    }

    // 2. Resolve items (from DTO payload or from User Cart)
    let orderItemsToProcess: { vendor_product_id: number; quantity: number }[] = [];

    if (dto.items && dto.items.length > 0) {
      orderItemsToProcess = dto.items;
    } else {
      const cart = await this.cartService.getCartByUserId(dto.user_id);
      if (!cart.items || cart.items.length === 0) {
        throw new BadRequestException(
          'Cart is empty and no order items were provided',
        );
      }
      orderItemsToProcess = cart.items.map((ci) => ({
        vendor_product_id: ci.vendor_product_id,
        quantity: ci.quantity,
      }));
    }

    // 3. Validate items and stock availability
    const resolvedItemsData: {
      vendorProduct: VendorProduct;
      quantity: number;
      price: number;
      totalPrice: number;
      productName: string;
      sku: string;
    }[] = [];

    for (const item of orderItemsToProcess) {
      const vp = await this.vendorProductRepository.findOne({
        where: { id: item.vendor_product_id },
        relations: {
          vendor: true,
          product_variant: { product: true },
        },
      });

      if (!vp) {
        throw new NotFoundException(
          `Vendor product with ID ${item.vendor_product_id} not found`,
        );
      }

      if (vp.status !== 'active') {
        throw new BadRequestException(
          `Vendor product ${item.vendor_product_id} is not active`,
        );
      }

      const inv = await this.inventoryService.findByVendorProduct(vp.id);
      if (inv.available_quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for vendor product ${vp.id}. Available: ${inv.available_quantity}, Requested: ${item.quantity}`,
        );
      }

      const price = Number(vp.selling_price);
      const totalPrice = Math.round(price * item.quantity * 100) / 100;
      const productName =
        vp.product_variant?.product?.name ||
        vp.product_variant?.variant_name ||
        `Product #${vp.id}`;
      const sku = vp.product_variant?.sku || `SKU-${vp.id}`;

      resolvedItemsData.push({
        vendorProduct: vp,
        quantity: item.quantity,
        price,
        totalPrice,
        productName,
        sku,
      });
    }

    // 4. Group items by Vendor
    const vendorGroups = new Map<
      number,
      {
        vendor_id: number;
        subtotal: number;
        items: typeof resolvedItemsData;
      }
    >();

    let overallSubtotal = 0;

    for (const itemData of resolvedItemsData) {
      const vId = itemData.vendorProduct.vendor_id;
      if (!vendorGroups.has(vId)) {
        vendorGroups.set(vId, {
          vendor_id: vId,
          subtotal: 0,
          items: [],
        });
      }
      const group = vendorGroups.get(vId)!;
      group.items.push(itemData);
      group.subtotal += itemData.totalPrice;
      overallSubtotal += itemData.totalPrice;
    }

    overallSubtotal = Math.round(overallSubtotal * 100) / 100;
    const shippingAmount = dto.shipping_amount || 0;
    const discountAmount = dto.discount_amount || 0;
    const totalPrice =
      Math.round(
        (overallSubtotal - discountAmount + shippingAmount) * 100,
      ) / 100;

    // 5. Generate Order Number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;

    // 6. Create & Save Order Header
    const order = this.orderRepository.create({
      user_id: dto.user_id,
      order_number: orderNumber,
      subtotal: overallSubtotal,
      discount_amount: discountAmount,
      shipping_amount: shippingAmount,
      total_price: totalPrice,
      order_status: 'placed',
    });
    const savedOrder = await this.orderRepository.save(order);

    // 7. Save Order Address Snapshot
    const orderAddress = this.orderAddressRepository.create({
      order_id: savedOrder.id,
      name: addressSnapshot.name,
      mobile_number: addressSnapshot.mobile_number,
      address_line_1: addressSnapshot.address_line_1,
      address_line_2: addressSnapshot.address_line_2 || undefined,
      country: addressSnapshot.country,
      state: addressSnapshot.state,
      city: addressSnapshot.city,
      postal_code: addressSnapshot.postal_code,
    });
    await this.orderAddressRepository.save(orderAddress);

    // 8. Create OrderVendors and OrderItems
    for (const [, group] of vendorGroups) {
      const vendorSubtotal = Math.round(group.subtotal * 100) / 100;
      const orderVendor = this.orderVendorRepository.create({
        order_id: savedOrder.id,
        vendor_id: group.vendor_id,
        subtotal: vendorSubtotal,
        shipping_amount: 0,
        total_amount: vendorSubtotal,
        status: 'placed',
      });
      const savedOrderVendor = await this.orderVendorRepository.save(orderVendor);

      for (const itemData of group.items) {
        const orderItem = this.orderItemRepository.create({
          order_id: savedOrder.id,
          order_vendor_id: savedOrderVendor.id,
          vendor_product_id: itemData.vendorProduct.id,
          product_name: itemData.productName,
          sku: itemData.sku,
          quantity: itemData.quantity,
          price: itemData.price,
          total_price: itemData.totalPrice,
        });
        await this.orderItemRepository.save(orderItem);

        // Reserve inventory for each item
        await this.inventoryService.reserveInventory({
          vendor_product_id: itemData.vendorProduct.id,
          quantity: itemData.quantity,
          reference_type: 'ORDER',
          reference_id: savedOrder.id,
        });
      }
    }

    // 9. Record Order Status History Log
    const statusHistory = this.orderStatusHistoryRepository.create({
      order_id: savedOrder.id,
      status: 'placed',
      description: 'Order placed successfully',
    });
    await this.orderStatusHistoryRepository.save(statusHistory);

    // 10. Clear User Cart if needed
    if (dto.clear_cart !== false) {
      await this.cartService.clearCart(dto.user_id);
    }

    return this.findOne(savedOrder.id);
  }

  async findAll(
    filterDto?: FilterOrderDto,
  ): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const page = filterDto?.page || 1;
    const limit = filterDto?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.order_vendors', 'order_vendors')
      .leftJoinAndSelect('order_vendors.vendor', 'vendor')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.status_history', 'status_history');

    if (filterDto?.user_id) {
      query.andWhere('order.user_id = :userId', { userId: filterDto.user_id });
    }

    if (filterDto?.order_status) {
      query.andWhere('order.order_status = :status', {
        status: filterDto.order_status,
      });
    }

    if (filterDto?.vendor_id) {
      query.andWhere('order_vendors.vendor_id = :vendorId', {
        vendorId: filterDto.vendor_id,
      });
    }

    query.orderBy('order.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        user: true,
        address: true,
        order_vendors: {
          vendor: true,
          items: { vendor_product: true },
        },
        items: { vendor_product: true },
        status_history: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { order_number: orderNumber },
      relations: {
        user: true,
        address: true,
        order_vendors: {
          vendor: true,
          items: { vendor_product: true },
        },
        items: { vendor_product: true },
        status_history: true,
      },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with number ${orderNumber} not found`,
      );
    }

    return order;
  }

  async findByUser(
    userId: number,
    filterDto?: FilterOrderDto,
  ): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    return this.findAll({ ...filterDto, user_id: userId });
  }

  async findByVendor(vendorId: number): Promise<OrderVendor[]> {
    return this.orderVendorRepository.find({
      where: { vendor_id: vendorId },
      relations: {
        order: { user: true, address: true },
        items: { vendor_product: true },
      },
    });
  }

  async updateOrderStatus(
    id: number,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOne(id);
    const previousStatus = order.order_status;
    const newStatus = dto.status.toLowerCase();

    if (previousStatus === newStatus) {
      return order;
    }

    order.order_status = newStatus;
    await this.orderRepository.save(order);

    // Update child order_vendors statuses
    if (order.order_vendors) {
      for (const ov of order.order_vendors) {
        ov.status = newStatus;
        await this.orderVendorRepository.save(ov);
      }
    }

    // Append status history
    const history = this.orderStatusHistoryRepository.create({
      order_id: order.id,
      status: newStatus,
      description: dto.description || `Order status updated to ${newStatus}`,
    });
    await this.orderStatusHistoryRepository.save(history);

    // Inventory coupling
    if (newStatus === 'cancelled' && previousStatus !== 'cancelled') {
      // Release reserved stock for all items
      if (order.items) {
        for (const item of order.items) {
          await this.inventoryService.releaseInventory({
            vendor_product_id: item.vendor_product_id,
            quantity: item.quantity,
            reference_type: 'ORDER_CANCELLED',
            reference_id: order.id,
          });
        }
      }
    } else if (
      (newStatus === 'shipped' || newStatus === 'delivered') &&
      previousStatus !== 'shipped' &&
      previousStatus !== 'delivered'
    ) {
      // Deduct stock from reserved quantity
      if (order.items) {
        for (const item of order.items) {
          await this.inventoryService.deductInventory({
            vendor_product_id: item.vendor_product_id,
            quantity: item.quantity,
            from_reserved: true,
            reference_type: 'ORDER_FULFILLED',
            reference_id: order.id,
          });
        }
      }
    }

    return this.findOne(id);
  }
}
