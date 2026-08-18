import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

import { DeliveryAgentStatus } from '../../../common/enums/enums';

@Entity('delivery_agents')
export class DeliveryAgent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', unique: true })
  user_id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vehicle_type: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vehicle_number: string;

  @Column({
    type: 'enum',
    enum: DeliveryAgentStatus,
    default: DeliveryAgentStatus.AVAILABLE,
  })
  status: DeliveryAgentStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
