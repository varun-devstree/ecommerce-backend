import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  findAll() {
    return this.vendorRepository.find({
      relations: { vendor_users: true },
    });
  }

  findOne(id: number) {
    return this.vendorRepository.findOne({
      where: { id },
      relations: { vendor_users: true },
    });
  }
}
