import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderAddress } from './entities/order-address.entity';
import { OrderVendor } from './entities/order-vendor.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { User } from '../users/entities/user.entity';
import { VendorProduct } from '../vendor-products/entities/vendor-product.entity';
import { Address } from '../location/entities/address.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { CartModule } from '../cart/cart.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderAddress,
      OrderVendor,
      OrderItem,
      OrderStatusHistory,
      User,
      VendorProduct,
      Address,
    ]),
    InventoryModule,
    CartModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}
