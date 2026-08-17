import { IsNotEmpty, IsInt, Min, IsOptional, IsString } from 'class-validator';

export class ReserveInventoryDto {
  @IsNotEmpty()
  @IsInt()
  vendor_product_id: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  reference_type?: string; // e.g. 'ORDER', 'CART'

  @IsOptional()
  @IsInt()
  reference_id?: number;
}
