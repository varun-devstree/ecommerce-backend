import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/users/entities/role.entity';
import { UserRole } from '../../modules/users/entities/user-role.entity';
import { Vendor } from '../../modules/vendors/entities/vendor.entity';
import { VendorUser } from '../../modules/vendors/entities/vendor-user.entity';
import { DeliveryAgent } from '../../modules/delivery-agents/entities/delivery-agent.entity';
import { VendorStatus, DeliveryAgentStatus } from '../../common/enums/enums';

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
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(VendorUser)
    private readonly vendorUserRepository: Repository<VendorUser>,
    @InjectRepository(DeliveryAgent)
    private readonly deliveryAgentRepository: Repository<DeliveryAgent>,
  ) {}

  async seed() {
    this.logger.log('Starting Role & Account Seeder...');

    const defaultRoles = [
      { name: 'admin', description: 'Administrator with full system privileges' },
      { name: 'vendor', description: 'Vendor / Merchant account' },
      { name: 'customer', description: 'Standard customer account' },
      { name: 'delivery_agent', description: 'Delivery agent account' },
    ];

    for (const roleDef of defaultRoles) {
      try {
        const existing = await this.roleRepository.findOne({
          where: { name: roleDef.name },
        });
        if (!existing) {
          await this.roleRepository.save(this.roleRepository.create(roleDef));
          this.logger.log(`Seeded role: ${roleDef.name}`);
        }
      } catch (err: any) {
        this.logger.warn(`Role ${roleDef.name} seed warning: ${err?.message}`);
      }
    }

    const defaultUsers = [
      {
        name: 'Admin User',
        email: 'admin@ecommerce.com',
        password: 'AdminPassword123!',
        roleName: 'admin',
      },
      {
        name: 'Apex Vendor Owner',
        email: 'vendor@ecommerce.com',
        password: 'VendorPassword123!',
        roleName: 'vendor',
      },
      {
        name: 'Swift Delivery Agent',
        email: 'delivery@ecommerce.com',
        password: 'DeliveryPassword123!',
        roleName: 'delivery_agent',
      },
      {
        name: 'John Customer',
        email: 'customer@ecommerce.com',
        password: 'CustomerPassword123!',
        roleName: 'customer',
      },
    ];

    for (const uDef of defaultUsers) {
      try {
        let user = await this.userRepository.findOne({
          where: { email: uDef.email },
        });

        if (!user) {
          const roleEntity = await this.roleRepository.findOne({
            where: { name: uDef.roleName },
          });

          if (roleEntity) {
            const hashedPassword = await bcrypt.hash(uDef.password, 10);
            user = await this.userRepository.save(
              this.userRepository.create({
                name: uDef.name,
                email: uDef.email,
                password: hashedPassword,
                status: 'active',
              }),
            );

            await this.userRoleRepository.save(
              this.userRoleRepository.create({
                user_id: user.id,
                role_id: roleEntity.id,
              }),
            );

            this.logger.log(`Seeded account: ${uDef.email} (${uDef.roleName})`);
          }
        }

        if (user) {
          // Seed Vendor profile if role is vendor
          if (uDef.roleName === 'vendor') {
            try {
              const existingVendor = await this.vendorRepository.findOne({
                where: { email: uDef.email },
              });
              if (!existingVendor) {
                const newVendor = await this.vendorRepository.save(
                  this.vendorRepository.create({
                    name: 'Apex Electronics',
                    business_name: 'Apex Electronics Store',
                    email: uDef.email,
                    mobile_number: '9876543210',
                    status: VendorStatus.ACTIVE,
                  }),
                );

                await this.vendorUserRepository.save(
                  this.vendorUserRepository.create({
                    vendor_id: newVendor.id,
                    user_id: user.id,
                  }),
                );
                this.logger.log(`Seeded Vendor Profile: ${newVendor.business_name}`);
              }
            } catch (vendorErr: any) {
              this.logger.warn(`Vendor profile seed skipped: ${vendorErr?.message}`);
            }
          }

          // Seed DeliveryAgent profile if role is delivery_agent
          if (uDef.roleName === 'delivery_agent') {
            try {
              const existingAgent = await this.deliveryAgentRepository.findOne({
                where: { user_id: user.id },
              });
              if (!existingAgent) {
                await this.deliveryAgentRepository.save(
                  this.deliveryAgentRepository.create({
                    user_id: user.id,
                    vehicle_type: 'EV Scooter',
                    vehicle_number: 'EV-8821',
                    status: DeliveryAgentStatus.AVAILABLE,
                  }),
                );
                this.logger.log(`Seeded DeliveryAgent Profile for User #${user.id}`);
              }
            } catch (agentErr: any) {
              this.logger.warn(`DeliveryAgent profile seed skipped: ${agentErr?.message}`);
            }
          }
        }
      } catch (uErr: any) {
        this.logger.warn(`User seed for ${uDef.email} skipped: ${uErr?.message}`);
      }
    }

    this.logger.log('Role & Account Seeder finished successfully.');
  }
}
