import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty()
  @IsInt()
  user_id: number;

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
  @IsInt()
  country_id: number;

  @IsNotEmpty()
  @IsInt()
  state_id: number;

  @IsNotEmpty()
  @IsInt()
  city_id: number;

  @IsNotEmpty()
  @IsString()
  postal_code: string;

  @IsOptional()
  @IsString()
  address_type?: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
