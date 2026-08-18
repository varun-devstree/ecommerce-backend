import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/users/entities/role.entity';
import { UserRole } from '../../modules/users/entities/user-role.entity';
import { Country } from '../../modules/location/entities/country.entity';
import { State } from '../../modules/location/entities/state.entity';
import { City } from '../../modules/location/entities/city.entity';
import { Vendor } from '../../modules/vendors/entities/vendor.entity';
import { VendorUser } from '../../modules/vendors/entities/vendor-user.entity';
import { DeliveryAgent } from '../../modules/delivery-agents/entities/delivery-agent.entity';
import { RoleAndAdminSeeder } from './role-and-admin.seeder';
import { LocationSeeder } from './location.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      UserRole,
      Country,
      State,
      City,
      Vendor,
      VendorUser,
      DeliveryAgent,
    ]),
  ],
  providers: [RoleAndAdminSeeder, LocationSeeder],
  exports: [RoleAndAdminSeeder, LocationSeeder],
})
export class SeederModule implements OnModuleInit {
  constructor(
    private readonly roleAndAdminSeeder: RoleAndAdminSeeder,
    private readonly locationSeeder: LocationSeeder,
  ) {}

  async onModuleInit() {
    await this.roleAndAdminSeeder.seed();
    await this.locationSeeder.seed();
  }
}
