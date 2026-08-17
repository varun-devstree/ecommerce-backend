import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { VendorProduct } from '../../vendor-products/entities/vendor-product.entity';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', unique: true })
  vendor_product_id: number;

  @Column({ type: 'integer', default: 0 })
  quantity: number;

  @Column({ type: 'integer', default: 0 })
  reserved_quantity: number;

  @Column({ type: 'integer', default: 0 })
  available_quantity: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToOne(() => VendorProduct, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_product_id' })
  vendor_product: VendorProduct;
}
