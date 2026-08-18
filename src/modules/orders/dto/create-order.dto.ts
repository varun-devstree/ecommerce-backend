import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNotEmpty()
  @IsInt()
  vendor_product_id: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}

export class OrderAddressDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  mobile_number: string;

  @IsNotEmpty()
  @IsString()
  address_line_1: string;

  @IsOptional()
  @IsString()
  address_line_2?: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  postal_code: string;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsOptional()
  @IsInt()
  address_id?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderAddressDto)
  address?: OrderAddressDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  shipping_amount?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_amount?: number = 0;

  @IsOptional()
  @IsBoolean()
  clear_cart?: boolean = true;
}
