import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { OrderVendor } from './order-vendor.entity';
import { VendorProduct } from '../../vendor-products/entities/vendor-product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  order_id: number;

  @Column({ type: 'integer' })
  order_vendor_id: number;

  @Column({ type: 'integer' })
  vendor_product_id: number;

  @Column({ type: 'varchar', length: 255 })
  product_name: string;

  @Column({ type: 'varchar', length: 100 })
  sku: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_price: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => OrderVendor, (orderVendor) => orderVendor.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_vendor_id' })
  order_vendor: OrderVendor;

  @ManyToOne(() => VendorProduct, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vendor_product_id' })
  vendor_product: VendorProduct;
}
