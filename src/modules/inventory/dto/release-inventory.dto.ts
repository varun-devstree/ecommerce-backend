import { IsNotEmpty, IsInt, Min, IsOptional, IsString } from 'class-validator';

export class ReleaseInventoryDto {
  @IsNotEmpty()
  @IsInt()
  vendor_product_id: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  reference_type?: string;

  @IsOptional()
  @IsInt()
  reference_id?: number;
}
