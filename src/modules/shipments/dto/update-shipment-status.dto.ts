import { IsNotEmpty, IsString, IsOptional, IsInt, IsDateString } from 'class-validator';

export class UpdateShipmentStatusDto {
  @IsNotEmpty()
  @IsString()
  shipment_status: string; // e.g. 'pending', 'processing', 'in_transit', 'out_for_delivery', 'delivered', 'failed'

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
