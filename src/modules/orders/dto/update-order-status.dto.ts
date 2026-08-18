import { IsNotEmpty, IsEnum, IsString, IsOptional } from 'class-validator';
import { OrderStatus } from '../../../common/enums/enums';

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  description?: string;
}

