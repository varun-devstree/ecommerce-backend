import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { CouponUsage } from './coupon-usage.entity';
import { CouponStatus } from '../../../common/enums/enums';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 20 })
  discount_type: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  discount_value: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  minimum_order_value: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  maximum_discount: number;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ type: 'integer', nullable: true })
  usage_limit: number;

  @Column({
    type: 'enum',
    enum: CouponStatus,
    default: CouponStatus.ACTIVE,
  })
  status: CouponStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;


  @OneToMany(() => CouponUsage, (usage) => usage.coupon)
  usages: CouponUsage[];
}
