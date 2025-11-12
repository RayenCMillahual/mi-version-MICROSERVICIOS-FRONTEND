import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';
import { AddToCartDto, RemoveFromCartDto, UpdateCartItemDto } from '../../dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @MessagePattern('addToCart')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  addToCart(@Payload() dto: AddToCartDto) {
    return this.cartService.addToCart(dto);
  }

  @MessagePattern('getCart')
  getCart(@Payload() userId: string) {
    return this.cartService.getCart(userId);
  }

  @MessagePattern('removeFromCart')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  removeFromCart(@Payload() dto: RemoveFromCartDto) {
    return this.cartService.removeFromCart(dto);
  }

  @MessagePattern('updateCartItem')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  updateCartItem(@Payload() dto: UpdateCartItemDto) {
    return this.cartService.updateCartItem(dto);
  }

  @MessagePattern('clearCart')
  clearCart(@Payload() userId: string) {
    return this.cartService.clearCart(userId);
  }

  @MessagePattern('removeExpiredCartItems')
  removeExpiredItems(@Payload() userId: string) {
    return this.cartService.removeExpiredItems(userId);
  }
}