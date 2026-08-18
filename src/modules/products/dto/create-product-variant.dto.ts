import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ProductStatus } from '../../../common/enums/enums';

export class CreateProductVariantDto {
  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  variant_name?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus = ProductStatus.ACTIVE;
}

