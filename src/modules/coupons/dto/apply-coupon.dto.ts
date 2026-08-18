import { IsNotEmpty, IsString, IsInt, IsNumber, Min } from 'class-validator';

export class ApplyCouponDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  order_subtotal: number;
}
