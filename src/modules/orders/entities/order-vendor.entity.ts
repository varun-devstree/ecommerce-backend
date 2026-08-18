import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { OrderItem } from './order-item.entity';

import { OrderStatus } from '../../../common/enums/enums';

@Entity('order_vendors')
@Index(['order_id', 'vendor_id'], { unique: true })
export class OrderVendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  order_id: number;

  @Column({ type: 'integer' })
  vendor_id: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shipping_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_amount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PLACED,
  })
  status: OrderStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => Order, (order) => order.order_vendors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Vendor, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order_vendor)
  items: OrderItem[];
}
