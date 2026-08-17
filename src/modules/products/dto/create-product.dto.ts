import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsInt()
  category_id: number;

  @IsOptional()
  @IsInt()
  brand_id?: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
