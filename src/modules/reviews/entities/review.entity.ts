import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { ReviewStatus } from '../../../common/enums/enums';

@Entity('reviews')
@Index(['user_id', 'product_id'], { unique: true })
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  user_id: number;

  @Column({ type: 'integer' })
  product_id: number;

  @Column({ type: 'integer' })
  rating: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.ACTIVE,
  })
  status: ReviewStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;


  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
