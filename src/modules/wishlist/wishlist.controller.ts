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
import { RESPONSE_MESSAGES } from '../../common/constants';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.WISHLIST.FETCH_USER_SUCCESS)
  getWishlistByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.wishlistService.getWishlistByUserId(userId);
  }

  @Post('items')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.WISHLIST.ADD_ITEM_SUCCESS)
  addToWishlist(@Body() dto: AddToWishlistDto) {
    return this.wishlistService.addToWishlist(dto);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.WISHLIST.REMOVE_ITEM_SUCCESS)
  removeWishlistItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.wishlistService.removeWishlistItem(itemId);
  }
}
