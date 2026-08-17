import { IsNotEmpty, IsInt, Min, IsOptional, IsString, IsBoolean } from 'class-validator';

export class DeductInventoryDto {
  @IsNotEmpty()
  @IsInt()
  vendor_product_id: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsBoolean()
  from_reserved?: boolean = true; // By default deduct from reserved stock

  @IsOptional()
  @IsString()
  reference_type?: string; // e.g. 'ORDER', 'SHIPMENT'

  @IsOptional()
  @IsInt()
  reference_id?: number;
}
