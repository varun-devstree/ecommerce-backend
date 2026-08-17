import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryAgent } from './entities/delivery-agent.entity';

@Injectable()
export class DeliveryAgentsService {
  constructor(
    @InjectRepository(DeliveryAgent)
    private readonly deliveryAgentRepository: Repository<DeliveryAgent>,
  ) {}

  findAll() {
    return this.deliveryAgentRepository.find({
      relations: { user: true },
    });
  }

  findOne(id: number) {
    return this.deliveryAgentRepository.findOne({
      where: { id },
      relations: { user: true },
    });
  }
}
