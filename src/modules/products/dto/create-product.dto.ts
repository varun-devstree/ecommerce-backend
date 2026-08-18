import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../../../common/enums/enums';
import { CreateProductVariantDto } from './create-product-variant.dto';
import { CreateProductAttributeDto } from './create-product-attribute.dto';
import { CreateProductImageDto } from './create-product-image.dto';

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
  @IsEnum(ProductStatus)
  status?: ProductStatus = ProductStatus.ACTIVE;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductAttributeDto)
  attributes?: CreateProductAttributeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];
}
