import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderAddress } from './entities/order-address.entity';
import { OrderVendor } from './entities/order-vendor.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';

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
  ) {}

  findAll() {
    return this.orderRepository.find({
      relations: {
        address: true,
        order_vendors: true,
        items: true,
        status_history: true,
      },
    });
  }

  findOne(id: number) {
    return this.orderRepository.findOne({
      where: { id },
      relations: {
        address: true,
        order_vendors: true,
        items: true,
        status_history: true,
      },
    });
  }

  findByUser(userId: number) {
    return this.orderRepository.find({
      where: { user_id: userId },
      relations: {
        address: true,
        order_vendors: true,
        items: true,
      },
    });
  }
}
