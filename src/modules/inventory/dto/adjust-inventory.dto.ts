import { IsNotEmpty, IsInt, IsString, IsOptional } from 'class-validator';

export class AdjustInventoryDto {
  @IsNotEmpty()
  @IsInt()
  vendor_product_id: number;

  @IsNotEmpty()
  @IsInt()
  quantity: number; // Delta quantity (positive to add, negative to reduce)

  @IsNotEmpty()
  @IsString()
  operation: string; // e.g. 'RESTOCK', 'MANUAL_ADJUSTMENT', 'CORRECTION', 'DAMAGE_WRITE_OFF'

  @IsOptional()
  @IsString()
  reference_type?: string;

  @IsOptional()
  @IsInt()
  reference_id?: number;
}
