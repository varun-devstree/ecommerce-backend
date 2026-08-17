import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Cart } from './cart.entity';
import { VendorProduct } from '../../vendor-products/entities/vendor-product.entity';

@Entity('cart_items')
@Index(['cart_id', 'vendor_product_id'], { unique: true })
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  cart_id: number;

  @Column({ type: 'integer' })
  vendor_product_id: number;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => VendorProduct, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_product_id' })
  vendor_product: VendorProduct;
}
