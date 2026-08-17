import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get('user/:userId')
  getWishlistByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.wishlistService.getWishlistByUserId(userId);
  }

  @Post('items')
  addToWishlist(@Body() dto: AddToWishlistDto) {
    return this.wishlistService.addToWishlist(dto);
  }

  @Delete('items/:itemId')
  removeWishlistItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.wishlistService.removeWishlistItem(itemId);
  }
}
