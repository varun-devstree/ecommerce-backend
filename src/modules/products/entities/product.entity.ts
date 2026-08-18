import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductImage } from './product-image.entity';
import { ProductAttribute } from './product-attribute.entity';
import { ProductStatus } from '../../../common/enums/enums';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  category_id: number;

  @Column({ type: 'integer', nullable: true })
  brand_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ type: 'integer', default: 0 })
  review_count: number;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Brand, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @OneToMany(() => ProductAttribute, (attribute) => attribute.product)
  attributes: ProductAttribute[];
}
