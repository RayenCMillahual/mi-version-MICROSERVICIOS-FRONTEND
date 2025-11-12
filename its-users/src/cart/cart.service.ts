import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto, RemoveFromCartDto, UpdateCartItemDto } from '../../dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(dto: AddToCartDto) {
    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User ${dto.userId} not found`);
    }

    // Buscar o crear el carrito del usuario
    let cart = await this.prisma.cart.findUnique({
      where: { userId: dto.userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId: dto.userId },
        include: { items: true },
      });
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: dto.productId,
        },
      },
    });

    if (existingItem) {
      // Actualizar cantidad
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { 
          quantity: existingItem.quantity + dto.quantity,
          reservedAt: new Date(), // Actualizar fecha de reserva
        },
      });
    } else {
      // Crear nuevo item
      return this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
        },
      });
    }
  }

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { reservedAt: 'desc' },
        },
      },
    });

    if (!cart) {
      return {
        userId,
        items: [],
        totalItems: 0,
      };
    }

    return {
      ...cart,
      totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  async removeFromCart(dto: RemoveFromCartDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId: dto.userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const deletedItem = await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: dto.productId,
      },
    });

    if (deletedItem.count === 0) {
      throw new NotFoundException('Item not found in cart');
    }

    return { message: 'Item removed from cart' };
  }

  async updateCartItem(dto: UpdateCartItemDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId: dto.userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: dto.productId,
        },
      },
    });

    if (!existingItem) {
      throw new NotFoundException('Item not found in cart');
    }

    return this.prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { 
        quantity: dto.quantity,
        reservedAt: new Date(),
      },
    });
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { message: 'Cart cleared' };
  }

  async removeExpiredItems(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) return { message: 'No cart found' };

    // Eliminar items de más de 3 días
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const deleted = await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        reservedAt: {
          lt: threeDaysAgo,
        },
      },
    });

    return {
      message: 'Expired items removed',
      deletedCount: deleted.count,
    };
  }
}