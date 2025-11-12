// its-gateway/src/clients/products-proxy.service.ts
import { Injectable, Inject, RequestTimeoutException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';

@Injectable()
export class ProductsProxyService {
  private readonly TIMEOUT_MS = 5000; // 5 segundos

  constructor(
    @Inject('MS_PRODUCT') private readonly client: ClientProxy,
  ) {}

  private async sendWithTimeout<T>(pattern: string, data: any): Promise<T> {
    try {
      return await firstValueFrom(
        this.client.send<T>(pattern, data).pipe(
          timeout(this.TIMEOUT_MS),
          catchError((error) => {
            if (error.name === 'TimeoutError') {
              throw new RequestTimeoutException(
                `Products service timeout after ${this.TIMEOUT_MS}ms`
              );
            }
            throw error;
          })
        )
      );
    } catch (error) {
      throw error;
    }
  }

  // ====== MÉTODOS ORIGINALES ======
  create(dto: any) {
    return this.sendWithTimeout('createProduct', dto);
  }
  
  findAll() {
    return this.sendWithTimeout('findAllProducts', {});
  }
  
  findOne(id: string) {
    return this.sendWithTimeout('findOneProduct', id);
  }
  
  update(id: string, dto: any) {
    return this.sendWithTimeout('updateProduct', { id, dto });
  }
  
  remove(id: string) {
    return this.sendWithTimeout('removeProduct', id);
  }

  // ====== MÉTODOS PARA STOCK Y RESERVAS ======
  checkAvailableStock(dto: any) {
    return this.sendWithTimeout('checkAvailableStock', dto);
  }

  createReservation(dto: any) {
    return this.sendWithTimeout('createReservation', dto);
  }

  confirmReservation(reservationId: string) {
    return this.sendWithTimeout('confirmReservation', reservationId);
  }

  cancelReservation(reservationId: string) {
    return this.sendWithTimeout('cancelReservation', reservationId);
  }

  cleanExpiredReservations() {
    return this.sendWithTimeout('cleanExpiredReservations', {});
  }

  getUserReservations(userId: string) {
    return this.sendWithTimeout('getUserReservations', userId);
  }
}