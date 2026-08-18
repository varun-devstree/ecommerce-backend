import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { VendorUser } from './vendor-user.entity';

import { VendorStatus } from '../../../common/enums/enums';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 150 })
  business_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  mobile_number: string;

  @Column({
    type: 'enum',
    enum: VendorStatus,
    default: VendorStatus.ACTIVE,
  })
  status: VendorStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => VendorUser, (vendorUser) => vendorUser.vendor)
  vendor_users: VendorUser[];
}
