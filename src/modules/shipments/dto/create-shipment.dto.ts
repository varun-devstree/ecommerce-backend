import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateShipmentDto {
  @IsNotEmpty()
  @IsInt()
  order_id: number;

  @IsNotEmpty()
  @IsInt()
  order_vendor_id: number;

  @IsOptional()
  @IsInt()
  delivery_agent_id?: number;

  @IsOptional()
  @IsString()
  shipping_method?: string;

  @IsOptional()
  @IsString()
  tracking_number?: string;

  @IsOptional()
  @IsString()
  carrier?: string;

  @IsOptional()
  @IsString()
  shipment_status?: string = 'pending';

  @IsOptional()
  @IsDateString()
  estimated_delivery_date?: string;
}
