import { IsOptional, IsInt, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CouponStatus } from '../../../common/enums/enums';

export class FilterCouponDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEnum(CouponStatus)
  status?: CouponStatus;

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
