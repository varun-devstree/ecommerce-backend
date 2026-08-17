import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  findAll() {
    return this.reviewRepository.find({
      relations: { user: true, product: true },
    });
  }

  findByProduct(productId: number) {
    return this.reviewRepository.find({
      where: { product_id: productId },
      relations: { user: true },
    });
  }

  findOne(id: number) {
    return this.reviewRepository.findOne({
      where: { id },
      relations: { user: true, product: true },
    });
  }
}
