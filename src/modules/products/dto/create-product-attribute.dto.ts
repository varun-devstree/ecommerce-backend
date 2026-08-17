import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductAttributeDto {
  @IsNotEmpty()
  @IsString()
  attribute_name: string;

  @IsNotEmpty()
  @IsString()
  attribute_value: string;
}
