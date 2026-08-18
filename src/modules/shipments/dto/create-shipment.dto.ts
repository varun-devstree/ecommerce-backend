import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ShipmentStatus } from '../../../common/enums/enums';

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
  @IsEnum(ShipmentStatus)
  shipment_status?: ShipmentStatus = ShipmentStatus.PENDING;

  @IsOptional()
  @IsDateString()
  estimated_delivery_date?: string;
}
