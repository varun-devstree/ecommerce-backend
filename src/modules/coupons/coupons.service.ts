import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponUsage } from './entities/coupon-usage.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { RecordCouponUsageDto } from './dto/record-coupon-usage.dto';
import { FilterCouponDto } from './dto/filter-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private readonly couponUsageRepository: Repository<CouponUsage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async createCoupon(dto: CreateCouponDto): Promise<Coupon> {
    const formattedCode = dto.code.trim().toUpperCase();

    const existing = await this.couponRepository.findOne({
      where: { code: formattedCode },
    });
    if (existing) {
      throw new ConflictException(
        `Coupon code '${formattedCode}' already exists`,
      );
    }

    const startDate = new Date(dto.start_date);
    const endDate = new Date(dto.end_date);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const coupon = this.couponRepository.create({
      code: formattedCode,
      discount_type: dto.discount_type.toLowerCase(),
      discount_value: dto.discount_value,
      minimum_order_value: dto.minimum_order_value,
      maximum_discount: dto.maximum_discount,
      start_date: startDate,
      end_date: endDate,
      usage_limit: dto.usage_limit,
      status: dto.status || 'active',
    });

    return this.couponRepository.save(coupon);
  }

  async validateAndApplyCoupon(
    dto: ApplyCouponDto,
  ): Promise<{ coupon: Coupon; discount_amount: number }> {
    const coupon = await this.findByCode(dto.code);

    if (coupon.status !== 'active') {
      throw new BadRequestException(
        `Coupon '${coupon.code}' is not currently active`,
      );
    }

    const now = new Date();
    if (now < new Date(coupon.start_date)) {
      throw new BadRequestException(`Coupon '${coupon.code}' is not yet active`);
    }

    if (now > new Date(coupon.end_date)) {
      throw new BadRequestException(`Coupon '${coupon.code}' has expired`);
    }

    if (
      coupon.minimum_order_value &&
      dto.order_subtotal < coupon.minimum_order_value
    ) {
      throw new BadRequestException(
        `Minimum order value for coupon '${coupon.code}' is $${coupon.minimum_order_value}`,
      );
    }

    if (coupon.usage_limit) {
      const usageCount = await this.couponUsageRepository.count({
        where: { coupon_id: coupon.id },
      });
      if (usageCount >= coupon.usage_limit) {
        throw new BadRequestException(
          `Coupon '${coupon.code}' has reached its maximum usage limit`,
        );
      }
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (dto.order_subtotal * coupon.discount_value) / 100;
      if (coupon.maximum_discount && discountAmount > coupon.maximum_discount) {
        discountAmount = Number(coupon.maximum_discount);
      }
    } else {
      discountAmount = Number(coupon.discount_value);
    }

    discountAmount = Math.min(discountAmount, dto.order_subtotal);
    discountAmount = Math.round(discountAmount * 100) / 100;

    return { coupon, discount_amount: discountAmount };
  }

  async recordUsage(dto: RecordCouponUsageDto): Promise<CouponUsage> {
    const coupon = await this.findOne(dto.coupon_id);
    const user = await this.userRepository.findOne({
      where: { id: dto.user_id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.user_id} not found`);
    }

    const order = await this.orderRepository.findOne({
      where: { id: dto.order_id },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.order_id} not found`);
    }

    const existingUsage = await this.couponUsageRepository.findOne({
      where: {
        coupon_id: dto.coupon_id,
        user_id: dto.user_id,
        order_id: dto.order_id,
      },
    });

    if (existingUsage) {
      return existingUsage;
    }

    const usage = this.couponUsageRepository.create({
      coupon_id: dto.coupon_id,
      user_id: dto.user_id,
      order_id: dto.order_id,
      discount_amount: dto.discount_amount,
    });

    return this.couponUsageRepository.save(usage);
  }

  async findAll(
    filterDto?: FilterCouponDto,
  ): Promise<{ data: Coupon[]; total: number; page: number; limit: number }> {
    const page = filterDto?.page || 1;
    const limit = filterDto?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.couponRepository.createQueryBuilder('coupon');

    if (filterDto?.code) {
      query.andWhere('coupon.code LIKE :code', {
        code: `%${filterDto.code.trim().toUpperCase()}%`,
      });
    }

    if (filterDto?.status) {
      query.andWhere('coupon.status = :status', { status: filterDto.status });
    }

    query.orderBy('coupon.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id },
      relations: { usages: true },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    return coupon;
  }

  async findByCode(code: string): Promise<Coupon> {
    const formattedCode = code.trim().toUpperCase();
    const coupon = await this.couponRepository.findOne({
      where: { code: formattedCode },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon '${formattedCode}' not found`);
    }

    return coupon;
  }

  async update(id: number, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findOne(id);

    if (dto.code && dto.code.trim().toUpperCase() !== coupon.code) {
      const formattedCode = dto.code.trim().toUpperCase();
      const existing = await this.couponRepository.findOne({
        where: { code: formattedCode },
      });
      if (existing) {
        throw new ConflictException(
          `Coupon code '${formattedCode}' already exists`,
        );
      }
      coupon.code = formattedCode;
    }

    if (dto.discount_type) {
      coupon.discount_type = dto.discount_type.toLowerCase();
    }
    if (dto.discount_value !== undefined) {
      coupon.discount_value = dto.discount_value;
    }
    if (dto.minimum_order_value !== undefined) {
      coupon.minimum_order_value = dto.minimum_order_value;
    }
    if (dto.maximum_discount !== undefined) {
      coupon.maximum_discount = dto.maximum_discount;
    }
    if (dto.start_date) {
      coupon.start_date = new Date(dto.start_date);
    }
    if (dto.end_date) {
      coupon.end_date = new Date(dto.end_date);
    }
    if (dto.usage_limit !== undefined) {
      coupon.usage_limit = dto.usage_limit;
    }
    if (dto.status) {
      coupon.status = dto.status;
    }

    await this.couponRepository.save(coupon);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const coupon = await this.findOne(id);
    coupon.status = 'deleted';
    await this.couponRepository.save(coupon);
    await this.couponRepository.softRemove(coupon);
    return { message: `Coupon '${coupon.code}' successfully soft deleted` };
  }

  async getUsagesByCoupon(couponId: number): Promise<CouponUsage[]> {
    await this.findOne(couponId);
    return this.couponUsageRepository.find({
      where: { coupon_id: couponId },
      relations: { user: true, order: true },
    });
  }

  async getUsagesByUser(userId: number): Promise<CouponUsage[]> {
    return this.couponUsageRepository.find({
      where: { user_id: userId },
      relations: { coupon: true, order: true },
    });
  }
}
