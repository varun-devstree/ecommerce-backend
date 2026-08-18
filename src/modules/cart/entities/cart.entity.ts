import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';
import { Address } from '../../location/entities/address.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', unique: true })
  user_id: number;

  @Column({ type: 'integer', nullable: true })
  address_id: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Address, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'address_id' })
  address: Address | null;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  items: CartItem[];
}

