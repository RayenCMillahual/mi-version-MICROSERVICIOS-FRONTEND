import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateReservationDto, CheckStockDto } from './dto/create-reservation.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  // ====== CRUD ORIGINAL ======
  @MessagePattern('createProduct')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Payload() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @MessagePattern('findAllProducts')
  findAll() {
    return this.service.findAll();
  }

  @MessagePattern('findOneProduct')
  findOne(@Payload() id: string) {
    return this.service.findOne(id);
  }

  @MessagePattern('updateProduct')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  update(@Payload() data: { id: string; dto: UpdateProductDto }) {
    return this.service.update(data.id, data.dto);
  }

  @MessagePattern('removeProduct')
  remove(@Payload() id: string) {
    return this.service.remove(id);
  }

  // ====== NUEVOS ENDPOINTS PARA STOCK Y RESERVAS ======
  @MessagePattern('checkAvailableStock')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  checkStock(@Payload() dto: CheckStockDto) {
    return this.service.checkAvailableStock(dto);
  }

  @MessagePattern('createReservation')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  createReservation(@Payload() dto: CreateReservationDto) {
    return this.service.createReservation(dto);
  }

  @MessagePattern('confirmReservation')
  confirmReservation(@Payload() reservationId: string) {
    return this.service.confirmReservation(reservationId);
  }

  @MessagePattern('cancelReservation')
  cancelReservation(@Payload() reservationId: string) {
    return this.service.cancelReservation(reservationId);
  }

  @MessagePattern('cleanExpiredReservations')
  cleanExpiredReservations() {
    return this.service.cleanExpiredReservations();
  }

  @MessagePattern('getUserReservations')
  getUserReservations(@Payload() userId: string) {
    return this.service.getUserReservations(userId);
  }
}