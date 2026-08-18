import { IsNotEmpty, IsEnum, IsString, IsOptional, IsInt, IsDateString } from 'class-validator';
import { ShipmentStatus } from '../../../common/enums/enums';

export class UpdateShipmentStatusDto {
  @IsNotEmpty()
  @IsEnum(ShipmentStatus)
  shipment_status: ShipmentStatus;

  @IsOptional()
  @IsInt()
  delivery_agent_id?: number;

  @IsOptional()
  @IsString()
  tracking_number?: string;

  @IsOptional()
  @IsString()
  carrier?: string;

  @IsOptional()
  @IsDateString()
  estimated_delivery_date?: string;

  @IsOptional()
  @IsDateString()
  shipped_at?: string;

  @IsOptional()
  @IsDateString()
  delivered_at?: string;
}
