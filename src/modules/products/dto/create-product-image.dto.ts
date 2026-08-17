import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateProductImageDto {
  @IsNotEmpty()
  @IsString()
  image_url: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}
