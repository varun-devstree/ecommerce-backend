import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('user/:userId')
  getCartByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartService.getCartByUserId(userId);
  }

  @Post('items')
  addToCart(@Body() dto: AddToCartDto) {
    return this.cartService.addToCart(dto);
  }

  @Patch('items/:itemId')
  updateCartItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(itemId, dto);
  }

  @Delete('items/:itemId')
  removeCartItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.cartService.removeCartItem(itemId);
  }

  @Delete('user/:userId/clear')
  clearCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartService.clearCart(userId);
  }
}
