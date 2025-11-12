import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductsProxyService {
  constructor(
    @Inject('MS_PRODUCT') private readonly client: ClientProxy,
  ) {}

  // ====== MÉTODOS ORIGINALES ======
  create(dto: any) {
    return firstValueFrom(this.client.send('createProduct', dto));
  }
  
  findAll() {
    return firstValueFrom(this.client.send('findAllProducts', {}));
  }
  
  findOne(id: string) {
    return firstValueFrom(this.client.send('findOneProduct', id));
  }
  
  update(id: string, dto: any) {
    return firstValueFrom(this.client.send('updateProduct', { id, dto }));
  }
  
  remove(id: string) {
    return firstValueFrom(this.client.send('removeProduct', id));
  }

  // ====== NUEVOS MÉTODOS PARA STOCK Y RESERVAS ======
  checkAvailableStock(dto: any) {
    return firstValueFrom(this.client.send('checkAvailableStock', dto));
  }

  createReservation(dto: any) {
    return firstValueFrom(this.client.send('createReservation', dto));
  }

  confirmReservation(reservationId: string) {
    return firstValueFrom(this.client.send('confirmReservation', reservationId));
  }

  cancelReservation(reservationId: string) {
    return firstValueFrom(this.client.send('cancelReservation', reservationId));
  }

  cleanExpiredReservations() {
    return firstValueFrom(this.client.send('cleanExpiredReservations', {}));
  }

  getUserReservations(userId: string) {
    return firstValueFrom(this.client.send('getUserReservations', userId));
  }
}