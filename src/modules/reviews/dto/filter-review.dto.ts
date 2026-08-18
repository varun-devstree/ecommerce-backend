import { IsOptional, IsInt, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReviewStatus } from '../../../common/enums/enums';

export class FilterReviewDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  product_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  user_id?: number;

  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
