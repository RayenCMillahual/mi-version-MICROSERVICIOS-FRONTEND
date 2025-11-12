// its-gateway/src/dto/cart.dto.ts
import { IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({
    description: 'ID del producto a agregar',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  productId!: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
    minimum: 1,
    type: 'integer'
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'ID del producto a actualizar',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  productId!: string;

  @ApiProperty({
    description: 'Nueva cantidad del producto',
    example: 3,
    minimum: 1,
    type: 'integer'
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class RemoveFromCartDto {
  @ApiProperty({
    description: 'ID del producto a remover',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  productId!: string;
}

export class CartItemDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '507f1f77bcf86cd799439011'
  })
  productId!: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2
  })
  quantity!: number;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Gaming'
  })
  productName!: string;

  @ApiProperty({
    description: 'Precio unitario',
    example: 1200.99
  })
  productPrice!: number;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Laptop para gaming de alta gama'
  })
  productDescription!: string;

  @ApiProperty({
    description: 'Subtotal del item',
    example: 2401.98
  })
  subtotal!: number;

  @ApiProperty({
    description: 'Fecha de agregado al carrito',
    example: '2024-06-22T20:30:00.000Z'
  })
  addedAt!: Date;
}

export class CartResponseDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '507f1f77bcf86cd799439011'
  })
  userId!: string;

  @ApiProperty({
    description: 'Items en el carrito',
    type: [CartItemDto]
  })
  items!: CartItemDto[];

  @ApiProperty({
    description: 'Total del carrito',
    example: 2401.98
  })
  total!: number;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-06-22T20:30:00.000Z'
  })
  updatedAt!: Date;
}