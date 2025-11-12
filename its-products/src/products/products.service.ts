import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { ProductReservation } from '../entities/product-reservation.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateReservationDto, CheckStockDto } from './dto/create-reservation.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductReservation)
    private readonly reservationRepo: Repository<ProductReservation>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const entity = this.productRepo.create(dto);
    return this.productRepo.save(entity);
  }

  findAll(): Promise<Product[]> {
    return this.productRepo.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    await this.productRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Product ${id} not found`);
  }

  // ====== NUEVAS FUNCIONES PARA STOCK Y RESERVAS ======

  async checkAvailableStock(dto: CheckStockDto) {
    const product = await this.findOne(dto.productId);
    
    // Calcular stock reservado (que no está completado)
    const reserved = await this.reservationRepo
      .createQueryBuilder('res')
      .select('SUM(res.quantity)', 'total')
      .where('res.productId = :productId', { productId: dto.productId })
      .andWhere('res.isCompleted = false')
      .getRawOne();

    const reservedStock = parseInt(reserved?.total) || 0;
    const availableStock = product.stock - reservedStock;

    return {
      productId: dto.productId,
      totalStock: product.stock,
      reservedStock,
      availableStock,
      canReserve: availableStock >= dto.quantity,
      requestedQuantity: dto.quantity,
    };
  }

  async createReservation(dto: CreateReservationDto) {
    // Verificar que hay stock disponible
    const stockCheck = await this.checkAvailableStock({
      productId: dto.productId,
      quantity: dto.quantity,
    });

    if (!stockCheck.canReserve) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${stockCheck.availableStock}, Requested: ${dto.quantity}`
      );
    }

    // Crear la reserva
    const reservation = this.reservationRepo.create(dto);
    return this.reservationRepo.save(reservation);
  }

  async confirmReservation(reservationId: string) {
    const reservation = await this.reservationRepo.findOne({
      where: { id: reservationId },
      relations: ['product'],
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ${reservationId} not found`);
    }

    if (reservation.isCompleted) {
      throw new BadRequestException('Reservation already completed');
    }

    // Reducir stock permanentemente
    await this.productRepo.update(reservation.productId, {
      stock: () => `stock - ${reservation.quantity}`,
    });

    // Marcar reserva como completada
    reservation.isCompleted = true;
    await this.reservationRepo.save(reservation);

    return { message: 'Reservation confirmed and stock updated' };
  }

  async cancelReservation(reservationId: string) {
    const reservation = await this.reservationRepo.findOne({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ${reservationId} not found`);
    }

    if (reservation.isCompleted) {
      throw new BadRequestException('Cannot cancel completed reservation');
    }

    await this.reservationRepo.remove(reservation);
    return { message: 'Reservation cancelled' };
  }

  async cleanExpiredReservations() {
    // Eliminar reservas de más de 3 días que no están completadas
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const expiredReservations = await this.reservationRepo
      .createQueryBuilder()
      .delete()
      .where('reservedAt < :date', { date: threeDaysAgo })
      .andWhere('isCompleted = false')
      .execute();

    return {
      message: 'Expired reservations cleaned',
      deletedCount: expiredReservations.affected,
    };
  }

  async getUserReservations(userId: string) {
    return this.reservationRepo.find({
      where: { userId, isCompleted: false },
      relations: ['product'],
    });
  }
}