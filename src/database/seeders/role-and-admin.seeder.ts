import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/users/entities/role.entity';
import { UserRole } from '../../modules/users/entities/user-role.entity';

@Injectable()
export class RoleAndAdminSeeder {
  private readonly logger = new Logger(RoleAndAdminSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async seed() {
    this.logger.log('Starting Role & Admin Seeder...');

    const defaultRoles = [
      { name: 'admin', description: 'Administrator with full system privileges' },
      { name: 'vendor', description: 'Vendor / Merchant account' },
      { name: 'customer', description: 'Standard customer account' },
      { name: 'delivery_agent', description: 'Delivery agent account' },
    ];

    for (const roleDef of defaultRoles) {
      const existing = await this.roleRepository.findOne({
        where: { name: roleDef.name },
      });
      if (!existing) {
        await this.roleRepository.save(this.roleRepository.create(roleDef));
        this.logger.log(`Seeded role: ${roleDef.name}`);
      }
    }

    const adminEmail = 'admin@ecommerce.com';
    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const adminRole = await this.roleRepository.findOne({
        where: { name: 'admin' },
      });

      if (adminRole) {
        const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
        const adminUser = await this.userRepository.save(
          this.userRepository.create({
            name: 'Admin User',
            email: adminEmail,
            password: hashedPassword,
            status: 'active',
          }),
        );

        await this.userRoleRepository.save(
          this.userRoleRepository.create({
            user_id: adminUser.id,
            role_id: adminRole.id,
          }),
        );

        this.logger.log(`Seeded default admin user: ${adminEmail}`);
      }
    }

    this.logger.log('Role & Admin Seeder finished successfully.');
  }
}
