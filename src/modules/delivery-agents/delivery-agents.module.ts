import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryAgent } from './entities/delivery-agent.entity';
import { DeliveryAgentsService } from './delivery-agents.service';
import { DeliveryAgentsController } from './delivery-agents.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryAgent])],
  controllers: [DeliveryAgentsController],
  providers: [DeliveryAgentsService],
  exports: [DeliveryAgentsService, TypeOrmModule],
})
export class DeliveryAgentsModule {}
