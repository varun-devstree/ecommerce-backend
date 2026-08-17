import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { FilterReviewDto } from './dto/filter-review.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Review submitted successfully')
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Reviews fetched successfully')
  findAll(@Query() filterDto: FilterReviewDto) {
    return this.reviewsService.findAll(filterDto);
  }

  @Get('product/:productId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Reviews fetched by product ID successfully')
  findByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() filterDto: FilterReviewDto,
  ) {
    return this.reviewsService.findByProduct(productId, filterDto);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Reviews fetched by user ID successfully')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() filterDto: FilterReviewDto,
  ) {
    return this.reviewsService.findByUser(userId, filterDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Review details fetched successfully')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Review updated successfully')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Review deleted successfully')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.removeReview(id);
  }
}
