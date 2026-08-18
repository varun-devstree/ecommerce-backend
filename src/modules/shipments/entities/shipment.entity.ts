import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { OrderVendor } from '../../orders/entities/order-vendor.entity';
import { DeliveryAgent } from '../../delivery-agents/entities/delivery-agent.entity';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  order_id: number;

  @Column({ type: 'integer' })
  order_vendor_id: number;

  @Column({ type: 'integer', nullable: true })
  delivery_agent_id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  shipping_method: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  tracking_number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  carrier: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  shipment_status: string;

  @Column({ type: 'timestamp', nullable: true })
  estimated_delivery_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  shipped_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;


  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => OrderVendor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_vendor_id' })
  order_vendor: OrderVendor;

  @ManyToOne(() => DeliveryAgent, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'delivery_agent_id' })
  delivery_agent: DeliveryAgent;
}
