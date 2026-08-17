import { IsOptional, IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterInventoryHistoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vendor_product_id?: number;

  @IsOptional()
  @IsString()
  operation?: string;

  @IsOptional()
  @IsString()
  reference_type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  reference_id?: number;

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
