import { IsNotEmpty, IsInt } from 'class-validator';

export class AddToWishlistDto {
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsNotEmpty()
  @IsInt()
  product_id: number;
}
