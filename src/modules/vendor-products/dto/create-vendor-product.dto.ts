import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateVendorProductDto {
  @IsNotEmpty()
  @IsInt()
  vendor_id: number;

  @IsNotEmpty()
  @IsInt()
  product_variant_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  selling_price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  mrp?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  initial_quantity?: number;
}
