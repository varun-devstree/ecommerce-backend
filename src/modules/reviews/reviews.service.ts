import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { FilterReviewDto } from './dto/filter-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createReview(dto: CreateReviewDto): Promise<Review> {
    const user = await this.userRepository.findOne({
      where: { id: dto.user_id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.user_id} not found`);
    }

    const product = await this.productRepository.findOne({
      where: { id: dto.product_id },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${dto.product_id} not found`,
      );
    }

    const existing = await this.reviewRepository.findOne({
      where: { user_id: dto.user_id, product_id: dto.product_id },
    });
    if (existing) {
      throw new ConflictException(
        `User ${dto.user_id} has already reviewed product ${dto.product_id}`,
      );
    }

    const review = this.reviewRepository.create({
      user_id: dto.user_id,
      product_id: dto.product_id,
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
      status: 'active',
    });

    const savedReview = await this.reviewRepository.save(review);
    await this.recalculateProductRating(dto.product_id);

    return this.findOne(savedReview.id);
  }

  async findAll(
    filterDto?: FilterReviewDto,
  ): Promise<{ data: Review[]; total: number; page: number; limit: number }> {
    const page = filterDto?.page || 1;
    const limit = filterDto?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product');

    if (filterDto?.product_id) {
      query.andWhere('review.product_id = :productId', {
        productId: filterDto.product_id,
      });
    }

    if (filterDto?.user_id) {
      query.andWhere('review.user_id = :userId', { userId: filterDto.user_id });
    }

    if (filterDto?.status) {
      query.andWhere('review.status = :status', { status: filterDto.status });
    }

    query.orderBy('review.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: {
        user: true,
        product: true,
      },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async findByProduct(
    productId: number,
    filterDto?: FilterReviewDto,
  ): Promise<{ data: Review[]; total: number; page: number; limit: number }> {
    return this.findAll({ ...filterDto, product_id: productId, status: 'active' });
  }

  async findByUser(
    userId: number,
    filterDto?: FilterReviewDto,
  ): Promise<{ data: Review[]; total: number; page: number; limit: number }> {
    return this.findAll({ ...filterDto, user_id: userId });
  }

  async updateReview(id: number, dto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);

    if (dto.rating !== undefined) {
      review.rating = dto.rating;
    }
    if (dto.title !== undefined) {
      review.title = dto.title;
    }
    if (dto.comment !== undefined) {
      review.comment = dto.comment;
    }
    if (dto.status !== undefined) {
      review.status = dto.status;
    }

    await this.reviewRepository.save(review);
    await this.recalculateProductRating(review.product_id);

    return this.findOne(id);
  }

  async removeReview(id: number): Promise<{ message: string }> {
    const review = await this.findOne(id);
    review.status = 'deleted';
    await this.reviewRepository.save(review);
    await this.reviewRepository.softRemove(review);
    await this.recalculateProductRating(review.product_id);

    return { message: `Review with ID ${id} successfully soft deleted` };
  }

  private async recalculateProductRating(productId: number): Promise<void> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('review.product_id = :productId', { productId })
      .andWhere('review.status = :status', { status: 'active' })
      .getRawOne();

    const avgRating = result?.avgRating ? parseFloat(result.avgRating) : 0;
    const reviewCount = result?.reviewCount ? parseInt(result.reviewCount, 10) : 0;

    await this.productRepository.update(productId, {
      rating: Math.round(avgRating * 10) / 10,
      review_count: reviewCount,
    });
  }
}
