import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponUsage } from './entities/coupon-usage.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private readonly couponUsageRepository: Repository<CouponUsage>,
  ) {}

  findAll() {
    return this.couponRepository.find();
  }

  findByCode(code: string) {
    return this.couponRepository.findOne({ where: { code } });
  }

  findOne(id: number) {
    return this.couponRepository.findOne({
      where: { id },
      relations: { usages: true },
    });
  }
}
