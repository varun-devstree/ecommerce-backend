import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';

@Entity('vendor_products')
@Index(['vendor_id', 'product_variant_id'], { unique: true })
export class VendorProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  vendor_id: number;

  @Column({ type: 'integer' })
  product_variant_id: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  selling_price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  mrp: number;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => Vendor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_variant_id' })
  product_variant: ProductVariant;

  @OneToOne(() => Inventory, (inventory) => inventory.vendor_product)
  inventory: Inventory;
}

