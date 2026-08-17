import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
  IsInt,
} from 'class-validator';

export class CreateCouponDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  discount_type: string; // 'percentage' or 'fixed'

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  discount_value: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimum_order_value?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maximum_discount?: number;

  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @IsNotEmpty()
  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  usage_limit?: number;

  @IsOptional()
  @IsString()
  status?: string = 'active';
}
