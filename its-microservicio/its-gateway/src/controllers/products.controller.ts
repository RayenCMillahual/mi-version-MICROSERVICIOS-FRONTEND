// its-gateway/src/controllers/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProductsProxyService } from '../clients/products-proxy.service';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsProxy: ProductsProxyService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ 
    summary: 'Crear producto',
    description: 'Crea un nuevo producto en el catálogo'
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Producto creado exitosamente',
    schema: {
      example: {
        id: "507f1f77bcf86cd799439011",
        name: "Laptop Gaming",
        description: "Laptop para gaming de alta gama con RTX 4080",
        price: 1200.99,
        stock: 25,
        category: "Electronics",
        createdAt: "2024-06-22T20:30:00.000Z",
        updatedAt: "2024-06-22T20:30:00.000Z"
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: ['price must be a positive number', 'stock must be a positive number'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token requerido'
  })
  create(@Body() dto: CreateProductDto) {
    return this.productsProxy.create(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ 
    summary: 'Listar productos',
    description: 'Obtiene todos los productos disponibles en el catálogo'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de productos obtenida exitosamente',
    schema: {
      example: {
        products: [
          {
            id: "507f1f77bcf86cd799439011",
            name: "Laptop Gaming",
            description: "Laptop para gaming de alta gama",
            price: 1200.99,
            stock: 25,
            category: "Electronics",
            createdAt: "2024-06-22T20:30:00.000Z",
            updatedAt: "2024-06-22T20:30:00.000Z"
          },
          {
            id: "507f1f77bcf86cd799439012",
            name: "Mouse Gaming",
            description: "Mouse óptico para gaming",
            price: 79.99,
            stock: 100,
            category: "Electronics",
            createdAt: "2024-06-22T20:30:00.000Z",
            updatedAt: "2024-06-22T20:30:00.000Z"
          }
        ]
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token requerido'
  })
  findAll() {
    return this.productsProxy.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener producto por ID',
    description: 'Obtiene los detalles de un producto específico'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del producto',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto encontrado',
    schema: {
      example: {
        id: "507f1f77bcf86cd799439011",
        name: "Laptop Gaming",
        description: "Laptop para gaming de alta gama con RTX 4080",
        price: 1200.99,
        stock: 25,
        category: "Electronics",
        createdAt: "2024-06-22T20:30:00.000Z",
        updatedAt: "2024-06-22T20:30:00.000Z"
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Product not found',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token requerido'
  })
  findOne(@Param('id') id: string) {
    return this.productsProxy.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar producto',
    description: 'Actualiza los datos de un producto existente'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del producto',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto actualizado exitosamente',
    schema: {
      example: {
        id: "507f1f77bcf86cd799439011",
        name: "Laptop Gaming Pro",
        description: "Laptop gaming actualizada",
        price: 1299.99,
        stock: 30,
        category: "Electronics",
        createdAt: "2024-06-22T20:30:00.000Z",
        updatedAt: "2024-06-22T21:00:00.000Z"
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token requerido'
  })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsProxy.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar producto',
    description: 'Elimina un producto del catálogo'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del producto',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto eliminado exitosamente',
    schema: {
      example: {
        message: 'Product deleted successfully',
        deletedProduct: {
          id: "507f1f77bcf86cd799439011",
          name: "Laptop Gaming",
          description: "Laptop para gaming de alta gama"
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token requerido'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'No se puede eliminar - Producto en uso',
    schema: {
      example: {
        statusCode: 409,
        message: 'Cannot delete product: it is currently in use in orders',
        error: 'Conflict'
      }
    }
  })
  remove(@Param('id') id: string) {
    return this.productsProxy.remove(id);
  }
}