import { IsOptional, IsInt, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { VendorProductStatus } from '../../../common/enums/enums';

export class FilterVendorProductDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vendor_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  product_variant_id?: number;

  @IsOptional()
  @IsEnum(VendorProductStatus)
  status?: VendorProductStatus;

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
