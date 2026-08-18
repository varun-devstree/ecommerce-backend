import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Wishlist retrieved successfully')
  getWishlistByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.wishlistService.getWishlistByUserId(userId);
  }

  @Post('items')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Product added to wishlist successfully')
  addToWishlist(@Body() dto: AddToWishlistDto) {
    return this.wishlistService.addToWishlist(dto);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Wishlist item removed successfully')
  removeWishlistItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.wishlistService.removeWishlistItem(itemId);
  }
}
