import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from './entities/shipment.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderVendor } from '../orders/entities/order-vendor.entity';
import { DeliveryAgent } from '../delivery-agents/entities/delivery-agent.entity';
import { OrdersService } from '../orders/orders.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { FilterShipmentDto } from './dto/filter-shipment.dto';
import { ShipmentStatus, OrderStatus } from '../../common/enums/enums';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderVendor)
    private readonly orderVendorRepository: Repository<OrderVendor>,
    @InjectRepository(DeliveryAgent)
    private readonly deliveryAgentRepository: Repository<DeliveryAgent>,
    private readonly ordersService: OrdersService,
  ) {}

  async createShipment(dto: CreateShipmentDto): Promise<Shipment> {
    const order = await this.orderRepository.findOne({
      where: { id: dto.order_id },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.order_id} not found`);
    }

    const orderVendor = await this.orderVendorRepository.findOne({
      where: { id: dto.order_vendor_id, order_id: dto.order_id },
    });
    if (!orderVendor) {
      throw new NotFoundException(
        `Order vendor package with ID ${dto.order_vendor_id} not found for order ${dto.order_id}`,
      );
    }

    if (dto.delivery_agent_id) {
      const agent = await this.deliveryAgentRepository.findOne({
        where: { id: dto.delivery_agent_id },
      });
      if (!agent) {
        throw new NotFoundException(
          `Delivery agent with ID ${dto.delivery_agent_id} not found`,
        );
      }
    }

    const trackingNumber =
      dto.tracking_number ||
      `TRK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const shipment = this.shipmentRepository.create({
      order_id: dto.order_id,
      order_vendor_id: dto.order_vendor_id,
      delivery_agent_id: dto.delivery_agent_id,
      shipping_method: dto.shipping_method || 'Standard Ground',
      tracking_number: trackingNumber,
      carrier: dto.carrier || 'Express Logistics',
      shipment_status: dto.shipment_status || ShipmentStatus.PENDING,
      estimated_delivery_date: dto.estimated_delivery_date
        ? new Date(dto.estimated_delivery_date)
        : undefined,
    });

    const savedShipment = await this.shipmentRepository.save(shipment);
    return this.findOne(savedShipment.id);
  }

  async findAll(
    filterDto?: FilterShipmentDto,
  ): Promise<{ data: Shipment[]; total: number; page: number; limit: number }> {
    const page = filterDto?.page || 1;
    const limit = filterDto?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.shipmentRepository
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.order', 'order')
      .leftJoinAndSelect('shipment.order_vendor', 'order_vendor')
      .leftJoinAndSelect('shipment.delivery_agent', 'delivery_agent');

    if (filterDto?.order_id) {
      query.andWhere('shipment.order_id = :orderId', {
        orderId: filterDto.order_id,
      });
    }

    if (filterDto?.order_vendor_id) {
      query.andWhere('shipment.order_vendor_id = :orderVendorId', {
        orderVendorId: filterDto.order_vendor_id,
      });
    }

    if (filterDto?.delivery_agent_id) {
      query.andWhere('shipment.delivery_agent_id = :agentId', {
        agentId: filterDto.delivery_agent_id,
      });
    }

    if (filterDto?.shipment_status) {
      query.andWhere('shipment.shipment_status = :status', {
        status: filterDto.shipment_status,
      });
    }

    query.orderBy('shipment.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: {
        order: { user: true, address: true },
        order_vendor: { vendor: true, items: true },
        delivery_agent: { user: true },
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    return shipment;
  }

  async findByOrder(orderId: number): Promise<Shipment[]> {
    return this.shipmentRepository.find({
      where: { order_id: orderId },
      relations: {
        order_vendor: { vendor: true },
        delivery_agent: { user: true },
      },
    });
  }

  async findByVendorOrder(orderVendorId: number): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { order_vendor_id: orderVendorId },
      relations: {
        order: true,
        delivery_agent: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException(
        `Shipment for order vendor package ${orderVendorId} not found`,
      );
    }

    return shipment;
  }

  async findByDeliveryAgent(agentId: number): Promise<Shipment[]> {
    return this.shipmentRepository.find({
      where: { delivery_agent_id: agentId },
      relations: {
        order: { address: true },
        order_vendor: { vendor: true },
      },
    });
  }

  async updateShipmentStatus(
    id: number,
    dto: UpdateShipmentStatusDto,
  ): Promise<Shipment> {
    const shipment = await this.findOne(id);
    const newStatus = dto.shipment_status;

    shipment.shipment_status = newStatus;

    if (dto.delivery_agent_id) {
      shipment.delivery_agent_id = dto.delivery_agent_id;
    }

    if (dto.tracking_number) {
      shipment.tracking_number = dto.tracking_number;
    }

    if (dto.carrier) {
      shipment.carrier = dto.carrier;
    }

    if (dto.estimated_delivery_date) {
      shipment.estimated_delivery_date = new Date(dto.estimated_delivery_date);
    }

    if (dto.shipped_at) {
      shipment.shipped_at = new Date(dto.shipped_at);
    } else if (
      (newStatus === ShipmentStatus.IN_TRANSIT ||
        newStatus === ShipmentStatus.OUT_FOR_DELIVERY) &&
      !shipment.shipped_at
    ) {
      shipment.shipped_at = new Date();
    }

    if (dto.delivered_at) {
      shipment.delivered_at = new Date(dto.delivered_at);
    } else if (
      newStatus === ShipmentStatus.DELIVERED &&
      !shipment.delivered_at
    ) {
      shipment.delivered_at = new Date();
    }

    await this.shipmentRepository.save(shipment);

    // Sync order status via OrdersService if shipped or delivered
    if (newStatus === ShipmentStatus.DELIVERED) {
      await this.ordersService.updateOrderStatus(shipment.order_id, {
        status: OrderStatus.DELIVERED,
        description: `Shipment #${shipment.id} (${shipment.carrier}) updated to ${newStatus}`,
      });
    } else if (
      newStatus === ShipmentStatus.IN_TRANSIT ||
      newStatus === ShipmentStatus.OUT_FOR_DELIVERY
    ) {
      await this.ordersService.updateOrderStatus(shipment.order_id, {
        status: OrderStatus.SHIPPED,
        description: `Shipment #${shipment.id} (${shipment.carrier}) updated to ${newStatus}`,
      });
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const shipment = await this.findOne(id);
    shipment.shipment_status = ShipmentStatus.CANCELLED;
    await this.shipmentRepository.save(shipment);
    await this.shipmentRepository.softRemove(shipment);
    return { message: `Shipment with ID ${id} successfully soft deleted` };
  }
}

