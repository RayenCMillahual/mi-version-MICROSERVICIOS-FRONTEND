// its-gateway/src/dto/product.dto.ts
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Gaming'
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Laptop para gaming de alta gama con RTX 4080'
  })
  @IsString()
  description!: string;

  @ApiProperty({
    description: 'Precio del producto',
    example: 1200.99,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({
    description: 'Stock disponible',
    example: 25,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  stock!: number;

  @ApiProperty({
    description: 'Categoría del producto',
    example: 'Electronics',
    required: false
  })
  @IsOptional()
  @IsString()
  category?: string;
}

export class UpdateProductDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Gaming Pro',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Laptop gaming actualizada',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Precio del producto',
    example: 1299.99,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({
    description: 'Stock disponible',
    example: 30,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiProperty({
    description: 'Categoría del producto',
    example: 'Electronics',
    required: false
  })
  @IsOptional()
  @IsString()
  category?: string;
}