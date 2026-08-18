import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Country } from './country.entity';
import { State } from './state.entity';
import { City } from './city.entity';
import { CommonStatus } from '../../../common/enums/enums';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  user_id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  mobile_number: string;

  @Column({ type: 'varchar', length: 255 })
  address_line_1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address_line_2: string;

  @Column({ type: 'integer' })
  country_id: number;

  @Column({ type: 'integer' })
  state_id: number;

  @Column({ type: 'integer' })
  city_id: number;

  @Column({ type: 'varchar', length: 20 })
  postal_code: string;

  @Column({ type: 'varchar', length: 20, default: 'home' })
  address_type: string;

  @Column({ type: 'boolean', default: false })
  is_default: boolean;

  @Column({
    type: 'enum',
    enum: CommonStatus,
    default: CommonStatus.ACTIVE,
  })
  status: CommonStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'state_id' })
  state: State;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'city_id' })
  city: City;
}
