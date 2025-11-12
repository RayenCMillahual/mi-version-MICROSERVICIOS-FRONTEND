// its-gateway/src/controllers/invoices.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
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
import { InvoicesProxyService } from '../clients/invoices-proxy.service';

@ApiTags('Invoices')
@ApiBearerAuth('JWT-auth')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesProxyService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ 
    summary: 'Crear factura',
    description: 'Crea una nueva factura (solo el propio usuario puede crear sus facturas)'
  })
  @ApiBody({
    description: 'Datos de la factura',
    schema: {
      example: {
        items: [
          {
            productId: "507f1f77bcf86cd799439013",
            quantity: 2,
            price: 1200.99
          }
        ]
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Factura creada exitosamente',
    schema: {
      example: {
        id: "507f1f77bcf86cd799439011",
        userId: "507f1f77bcf86cd799439012",
        items: [
          {
            productId: "507f1f77bcf86cd799439013",
            quantity: 2,
            price: 1200.99
          }
        ],
        total: 2401.98,
        status: "pending",
        createdAt: "2024-06-22T20:30:00.000Z"
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token requerido'
  })
  create(@Body() dto: any, @Request() req) {
    // Solo el propio usuario puede crear sus facturas
    dto.userId = req.user.userId;
    return this.invoices.create(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ 
    summary: 'Listar todas las facturas (Solo Admin)',
    description: 'Obtiene todas las facturas del sistema. Solo disponible para administradores.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de facturas obtenida exitosamente'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado - Solo administradores',
    schema: {
      example: {
        statusCode: 403,
        message: 'Only administrators can view all invoices',
        error: 'Forbidden'
      }
    }
  })
  findAll(@Request() req) {
    // Solo ADMINISTRADORES pueden ver todas las facturas
    if (req.user.username !== 'admin') {
      throw new ForbiddenException('Only administrators can view all invoices');
    }
    return this.invoices.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  @ApiOperation({ 
    summary: 'Obtener mis facturas',
    description: 'Obtiene todas las facturas del usuario autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Facturas del usuario obtenidas exitosamente',
    schema: {
      example: {
        invoices: [
          {
            id: "507f1f77bcf86cd799439011",
            userId: "507f1f77bcf86cd799439012",
            items: [
              {
                productId: "507f1f77bcf86cd799439013",
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
        ]
      }
    }
  })
  findMyInvoices(@Request() req) {
    // Usuarios normales solo ven sus propias facturas
    const userId = req.user.userId;
    return this.invoices.findByUserId(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener factura por ID',
    description: 'Obtiene una factura específica. Solo el propietario o admin pueden verla.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de la factura',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Factura encontrada'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado - Solo puedes ver tus propias facturas'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Factura no encontrada'
  })
  async findOne(@Param('id') id: string, @Request() req) {
    const invoice = await this.invoices.findOne(id);
    
    // Solo el dueño de la factura o admin puede verla
    if (invoice.userId !== req.user.userId && req.user.username !== 'admin') {
      throw new ForbiddenException('You can only view your own invoices');
    }
    
    return invoice;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar factura',
    description: 'Actualiza una factura existente. Solo el propietario puede modificarla.'
  })
  @ApiParam({ name: 'id', description: 'ID de la factura' })
  @ApiBody({
    description: 'Datos para actualizar la factura',
    schema: {
      example: {
        status: "completed",
        notes: "Factura procesada correctamente"
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Factura actualizada exitosamente'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado - Solo puedes modificar tus propias facturas'
  })
  async update(@Param('id') id: string, @Body() dto: any, @Request() req) {
    const invoice = await this.invoices.findOne(id);
    
    // Solo el dueño puede modificar su factura
    if (invoice.userId !== req.user.userId) {
      throw new ForbiddenException('You can only modify your own invoices');
    }
    
    return this.invoices.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar factura (Solo Admin)',
    description: 'Elimina una factura del sistema. Solo disponible para administradores.'
  })
  @ApiParam({ name: 'id', description: 'ID de la factura' })
  @ApiResponse({ 
    status: 200, 
    description: 'Factura eliminada exitosamente'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado - Solo administradores',
    schema: {
      example: {
        statusCode: 403,
        message: 'Only administrators can delete invoices',
        error: 'Forbidden'
      }
    }
  })
  async remove(@Param('id') id: string, @Request() req) {
    // Solo ADMINISTRADORES pueden eliminar facturas
    if (req.user.username !== 'admin') {
      throw new ForbiddenException('Only administrators can delete invoices');
    }
    
    return this.invoices.remove(id);
  }
}