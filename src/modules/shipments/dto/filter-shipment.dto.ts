import { IsOptional, IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterShipmentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order_vendor_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  delivery_agent_id?: number;

  @IsOptional()
  @IsString()
  shipment_status?: string;

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
