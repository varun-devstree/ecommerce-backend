import { IsOptional, IsInt, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ShipmentStatus } from '../../../common/enums/enums';

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
  @IsEnum(ShipmentStatus)
  shipment_status?: ShipmentStatus;

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
