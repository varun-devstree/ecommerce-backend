import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cart retrieved successfully')
  getCartByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartService.getCartByUserId(userId);
  }

  @Post('items')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Item added to cart successfully')
  addToCart(@Body() dto: AddToCartDto) {
    return this.cartService.addToCart(dto);
  }

  @Patch('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cart item updated successfully')
  updateCartItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(itemId, dto);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cart item removed successfully')
  removeCartItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.cartService.removeCartItem(itemId);
  }

  @Delete('user/:userId/clear')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cart cleared successfully')
  clearCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartService.clearCart(userId);
  }
}
