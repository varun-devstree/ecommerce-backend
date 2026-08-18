import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { RESPONSE_MESSAGES } from '../../common/constants';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.CART.FETCH_SUCCESS)
  getCartByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('address_id') addressId?: string,
  ) {
    const parsedAddressId = addressId ? parseInt(addressId, 10) : undefined;
    return this.cartService.getCartByUserId(userId, parsedAddressId);
  }


  @Post('items')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.CART.ADD_ITEM_SUCCESS)
  addToCart(@Body() dto: AddToCartDto) {
    return this.cartService.addToCart(dto);
  }

  @Patch('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.CART.UPDATE_ITEM_SUCCESS)
  updateCartItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(itemId, dto);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.CART.REMOVE_ITEM_SUCCESS)
  removeCartItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.cartService.removeCartItem(itemId);
  }

  @Delete('user/:userId/clear')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.CART.CLEAR_SUCCESS)
  clearCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartService.clearCart(userId);
  }
}
