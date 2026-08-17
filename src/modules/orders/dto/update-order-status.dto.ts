import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsString()
  status: string; // e.g. 'placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'

  @IsOptional()
  @IsString()
  description?: string;
}
