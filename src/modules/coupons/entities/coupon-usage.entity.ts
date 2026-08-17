import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Coupon } from './coupon.entity';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('coupon_usages')
@Index(['coupon_id', 'user_id', 'order_id'], { unique: true })
export class CouponUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  coupon_id: number;

  @Column({ type: 'integer' })
  user_id: number;

  @Column({ type: 'integer' })
  order_id: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  discount_amount: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => Coupon, (coupon) => coupon.usages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
