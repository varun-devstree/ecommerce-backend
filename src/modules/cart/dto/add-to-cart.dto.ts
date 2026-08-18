import { IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';

export class AddToCartDto {
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsNotEmpty()
  @IsInt()
  vendor_product_id: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsInt()
  address_id?: number;
}

