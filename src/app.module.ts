import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';

import { UsersModule } from './modules/users/users.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { DeliveryAgentsModule } from './modules/delivery-agents/delivery-agents.module';
import { LocationModule } from './modules/location/location.module';
import { ProductsModule } from './modules/products/products.module';
import { VendorProductsModule } from './modules/vendor-products/vendor-products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CartModule } from './modules/cart/cart.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CouponsModule } from './modules/coupons/coupons.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    VendorsModule,
    DeliveryAgentsModule,
    LocationModule,
    ProductsModule,
    VendorProductsModule,
    InventoryModule,
    CartModule,
    WishlistModule,
    OrdersModule,
    ShipmentsModule,
    ReviewsModule,
    CouponsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
