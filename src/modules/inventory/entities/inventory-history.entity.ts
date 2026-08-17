import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VendorProduct } from '../../vendor-products/entities/vendor-product.entity';

@Entity('inventory_history')
export class InventoryHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  vendor_product_id: number;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'varchar', length: 50 })
  operation: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  reference_type: string;

  @Column({ type: 'integer', nullable: true })
  reference_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => VendorProduct, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_product_id' })
  vendor_product: VendorProduct;
}
