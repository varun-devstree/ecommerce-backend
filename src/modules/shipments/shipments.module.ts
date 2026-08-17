import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from './entities/shipment.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderVendor } from '../orders/entities/order-vendor.entity';
import { DeliveryAgent } from '../delivery-agents/entities/delivery-agent.entity';
import { OrdersModule } from '../orders/orders.module';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Shipment,
      Order,
      OrderVendor,
      DeliveryAgent,
    ]),
    OrdersModule,
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService, TypeOrmModule],
})
export class ShipmentsModule {}
