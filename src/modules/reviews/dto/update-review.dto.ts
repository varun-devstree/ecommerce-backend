import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { ReviewStatus } from '../../../common/enums/enums';

export class UpdateReviewDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;
}
