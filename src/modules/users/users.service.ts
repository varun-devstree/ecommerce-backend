import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  findAll() {
    return this.userRepository.find({
      relations: { user_roles: { role: true } },
    });
  }

  findOne(id: number | string) {
    const numericId = Number(id);
    if (!id || Number.isNaN(numericId) || !Number.isInteger(numericId)) {
      return null;
    }
    return this.userRepository.findOne({
      where: { id: numericId },
      relations: { user_roles: { role: true } },
    });
  }

  findById(id: number | string) {
    return this.findOne(id);
  }

  findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
      relations: { user_roles: { role: true } },
    });
  }

  findByMobileNumber(mobileNumber: string) {
    return this.userRepository.findOne({
      where: { mobile_number: mobileNumber },
      relations: { user_roles: { role: true } },
    });
  }

  findRoleByName(name: string) {
    return this.roleRepository.findOne({
      where: { name: name.toLowerCase().trim() },
    });
  }

  async assignRoleToUser(userId: number, roleId: number) {
    const existing = await this.userRoleRepository.findOne({
      where: { user_id: userId, role_id: roleId },
    });
    if (!existing) {
      const userRole = this.userRoleRepository.create({
        user_id: userId,
        role_id: roleId,
      });
      return this.userRoleRepository.save(userRole);
    }
    return existing;
  }

  async create(userData: Partial<User>) {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async updatePassword(id: number, hashedPassword: string) {
    await this.userRepository.update(id, { password: hashedPassword });
  }
}
