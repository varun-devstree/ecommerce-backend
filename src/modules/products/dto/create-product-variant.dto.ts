import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductVariantDto {
  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  variant_name?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
