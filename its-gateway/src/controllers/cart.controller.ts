// its-gateway/src/controllers/cart.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersProxyService } from '../clients/users-proxy.service';
import { ProductsProxyService } from '../clients/products-proxy.service';
import { InvoicesProxyService } from '../clients/invoices-proxy.service';
import { 
  AddToCartDto, 
  UpdateCartItemDto, 
  RemoveFromCartDto,
  CartResponseDto 
} from '../dto/cart.dto';

@ApiTags('Cart')
@ApiBearerAuth('JWT-auth')
@Controller('cart')
export class CartController {
  constructor(
    private readonly usersProxy: UsersProxyService,
    private readonly productsProxy: ProductsProxyService,
    private readonly invoicesProxy: InvoicesProxyService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('add')
  @ApiOperation({ 
    summary: 'Agregar producto al carrito',
    description: 'Agrega un producto al carrito del usuario con verificación de stock y creación de reserva'
  })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Producto agregado al carrito exitosamente',
    schema: {
      example: {
        message: 'Product added to cart successfully',
        cartItem: {
          productId: "507f1f77bcf86cd799439011",
          quantity: 2,
          addedAt: "2024-06-22T20:30:00.000Z"
        },
        reservation: {
          id: "507f1f77bcf86cd799439014",
          productId: "507f1f77bcf86cd799439011",
          userId: "507f1f77bcf86cd799439012",
          quantity: 2,
          expiresAt: "2024-06-22T21:30:00.000Z"
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Stock insuficiente o producto no encontrado',
    schema: {
      example: {
        statusCode: 400,
        message: 'Insufficient stock. Available: 10, Requested: 15',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token requerido'
  })
  async addToCart(@Request() req, @Body() dto: AddToCartDto) {
    const userId = req.user.userId;

    // 1. Verificar que el producto existe
    try {
      await this.productsProxy.findOne(dto.productId);
    } catch (error) {
      throw new BadRequestException('Product not found');
    }

    // 2. Verificar stock disponible
    const stockCheck = await this.productsProxy.checkAvailableStock({
      productId: dto.productId,
      quantity: dto.quantity,
    });

    if (!stockCheck.canReserve) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${stockCheck.availableStock}, Requested: ${dto.quantity}`
      );
    }

    // 3. Crear reserva en Products MS
    const reservation = await this.productsProxy.createReservation({
      productId: dto.productId,
      userId,
      quantity: dto.quantity,
    });

    // 4. Agregar al carrito en Users MS
    return this.usersProxy.addToCart({
      userId,
      productId: dto.productId,
      quantity: dto.quantity,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ 
    summary: 'Obtener carrito',
    description: 'Obtiene el carrito del usuario con información detallada de productos y precios calculados'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Carrito obtenido exitosamente',
    type: CartResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token requerido'
  })
  async getCart(@Request() req) {
    const userId = req.user.userId;
    const cart = await this.usersProxy.getCart(userId);

    // Enriquecer con información de productos
    const enrichedItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const product = await this.productsProxy.findOne(item.productId);
          return {
            ...item,
            productName: product.name,
            productPrice: product.price,
            productDescription: product.description,
            subtotal: product.price * item.quantity,
          };
        } catch (error) {
          return {
            ...item,
            productName: 'Product not found',
            productPrice: 0,
            productDescription: null,
            subtotal: 0,
          };
        }
      })
    );

    const total = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      ...cart,
      items: enrichedItems,
      total,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('item')
  @ApiOperation({ 
    summary: 'Actualizar cantidad de producto en carrito',
    description: 'Actualiza la cantidad de un producto específico en el carrito'
  })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Item del carrito actualizado exitosamente',
    schema: {
      example: {
        message: 'Cart item updated successfully',
        updatedItem: {
          productId: "507f1f77bcf86cd799439011",
          quantity: 5,
          updatedAt: "2024-06-22T21:00:00.000Z"
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Stock insuficiente para la nueva cantidad'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token requerido'
  })
  async updateCartItem(@Request() req, @Body() dto: UpdateCartItemDto) {
    const userId = req.user.userId;

    // Verificar stock disponible para la nueva cantidad
    const stockCheck = await this.productsProxy.checkAvailableStock({
      productId: dto.productId,
      quantity: dto.quantity,
    });

    if (!stockCheck.canReserve) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${stockCheck.availableStock}, Requested: ${dto.quantity}`
      );
    }

    return this.usersProxy.updateCartItem({
      userId,
      productId: dto.productId,
      quantity: dto.quantity,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('item')
  @ApiOperation({ 
    summary: 'Remover producto del carrito',
    description: 'Remueve un producto específico del carrito y cancela su reserva'
  })
  @ApiBody({ type: RemoveFromCartDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto removido del carrito exitosamente',
    schema: {
      example: {
        message: 'Product removed from cart successfully',
        removedProduct: {
          productId: "507f1f77bcf86cd799439011",
          quantity: 2
        },
        cancelledReservation: {
          id: "507f1f77bcf86cd799439014",
          status: "cancelled"
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado en el carrito'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token requerido'
  })
  async removeFromCart(@Request() req, @Body() dto: RemoveFromCartDto) {
    const userId = req.user.userId;

    // Cancelar reserva en Products MS
    const userReservations = await this.productsProxy.getUserReservations(userId);
    const reservation = userReservations.find(r => r.productId === dto.productId);
    
    if (reservation) {
      await this.productsProxy.cancelReservation(reservation.id);
    }

    return this.usersProxy.removeFromCart({
      userId,
      productId: dto.productId,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('clear')
  @ApiOperation({ 
    summary: 'Vaciar carrito',
    description: 'Remueve todos los productos del carrito y cancela todas las reservas'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Carrito vaciado exitosamente',
    schema: {
      example: {
        message: 'Cart cleared successfully',
        clearedItems: 5,
        cancelledReservations: 5
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token requerido'
  })
  async clearCart(@Request() req) {
    const userId = req.user.userId;

    // Cancelar todas las reservas del usuario
    const userReservations = await this.productsProxy.getUserReservations(userId);
    await Promise.all(
      userReservations.map(reservation => 
        this.productsProxy.cancelReservation(reservation.id)
      )
    );

    return this.usersProxy.clearCart(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('checkout')
  @ApiOperation({ 
    summary: 'Procesar compra (Checkout)',
    description: 'Finaliza la compra convirtiendo el carrito en una factura, confirma reservas y limpia el carrito'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Compra procesada exitosamente',
    schema: {
      example: {
        message: 'Purchase completed successfully',
        invoice: {
          id: "507f1f77bcf86cd799439015",
          userId: "507f1f77bcf86cd799439012",
          items: [
            {
              productId: "507f1f77bcf86cd799439011",
              productName: "Laptop Gaming",
              quantity: 2,
              price: 1200.99,
              subtotal: 2401.98
            }
          ],
          total: 2401.98,
          status: "completed",
          createdAt: "2024-06-22T20:30:00.000Z"
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Carrito vacío',
    schema: {
      example: {
        statusCode: 400,
        message: 'Cart is empty',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token requerido'
  })
  async checkout(@Request() req) {
    const userId = req.user.userId;

    // 1. Obtener carrito
    const cart = await this.usersProxy.getCart(userId);
    
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 2. Confirmar todas las reservas
    const userReservations = await this.productsProxy.getUserReservations(userId);
    await Promise.all(
      userReservations.map(reservation => 
        this.productsProxy.confirmReservation(reservation.id)
      )
    );

    // 3. Crear factura
    const invoiceItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await this.productsProxy.findOne(item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        };
      })
    );

    const invoice = await this.invoicesProxy.create({
      userId,
      items: invoiceItems,
    });

    // 4. Limpiar carrito
    await this.usersProxy.clearCart(userId);

    return {
      message: 'Purchase completed successfully',
      invoice,
    };
  }
}