import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Vendor } from './vendor.entity';
import { User } from '../../users/entities/user.entity';

@Entity('vendor_users')
@Index(['vendor_id', 'user_id'], { unique: true })
export class VendorUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  vendor_id: number;

  @Column({ type: 'integer' })
  user_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => Vendor, (vendor) => vendor.vendor_users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
