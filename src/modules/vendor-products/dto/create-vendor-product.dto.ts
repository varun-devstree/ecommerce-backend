import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
import { VendorProductStatus } from '../../../common/enums/enums';

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
  @IsEnum(VendorProductStatus)
  status?: VendorProductStatus = VendorProductStatus.ACTIVE;

  @IsOptional()
  @IsInt()
  @Min(0)
  initial_quantity?: number;
}
