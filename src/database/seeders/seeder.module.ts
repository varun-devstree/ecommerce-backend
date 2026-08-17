import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/users/entities/role.entity';
import { UserRole } from '../../modules/users/entities/user-role.entity';
import { RoleAndAdminSeeder } from './role-and-admin.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRole])],
  providers: [RoleAndAdminSeeder],
  exports: [RoleAndAdminSeeder],
})
export class SeederModule implements OnModuleInit {
  constructor(private readonly roleAndAdminSeeder: RoleAndAdminSeeder) {}

  async onModuleInit() {
    await this.roleAndAdminSeeder.seed();
  }
}
