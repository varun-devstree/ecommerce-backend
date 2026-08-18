import { IsNotEmpty, IsInt, IsNumber, Min } from 'class-validator';

export class RecordCouponUsageDto {
  @IsNotEmpty()
  @IsInt()
  coupon_id: number;

  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsNotEmpty()
  @IsInt()
  order_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  discount_amount: number;
}
