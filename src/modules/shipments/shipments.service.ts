import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from './entities/shipment.entity';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
  ) {}

  findAll() {
    return this.shipmentRepository.find({
      relations: {
        order: true,
        order_vendor: true,
        delivery_agent: true,
      },
    });
  }

  findOne(id: number) {
    return this.shipmentRepository.findOne({
      where: { id },
      relations: {
        order: true,
        order_vendor: true,
        delivery_agent: true,
      },
    });
  }

  findByOrder(orderId: number) {
    return this.shipmentRepository.find({
      where: { order_id: orderId },
      relations: {
        order_vendor: true,
        delivery_agent: true,
      },
    });
  }
}
