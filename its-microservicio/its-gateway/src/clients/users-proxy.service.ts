// its-gateway/src/clients/users-proxy.service.ts MEJORADO

import { Injectable, Inject, RequestTimeoutException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { CreateUserDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';

@Injectable()
export class UsersProxyService {
  private readonly TIMEOUT_MS = 5000; // 5 segundos

  constructor(
    @Inject('MS_USER') private readonly client: ClientProxy,
  ) {}

  private async sendWithTimeout<T>(pattern: string, data: any): Promise<T> {
    try {
      return await firstValueFrom(
        this.client.send<T>(pattern, data).pipe(
          timeout(this.TIMEOUT_MS),
          catchError((error) => {
            if (error.name === 'TimeoutError') {
              throw new RequestTimeoutException(
                `Users service timeout after ${this.TIMEOUT_MS}ms`
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

  createUser(dto: CreateUserDto) {
    return this.sendWithTimeout('createUser', dto);
  }

  validateUser(dto: LoginDto) {
    return this.sendWithTimeout('validateUser', dto);
  }

  findAllUsers() {
    return this.sendWithTimeout('findAllUsers', {});
  }

  findOneUser(id: string) {
    return this.sendWithTimeout('findOneUser', id);
  }

  addToCart(dto: any) {
    return this.sendWithTimeout('addToCart', dto);
  }

  getCart(userId: string) {
    return this.sendWithTimeout('getCart', userId);
  }

  removeFromCart(dto: any) {
    return this.sendWithTimeout('removeFromCart', dto);
  }

  updateCartItem(dto: any) {
    return this.sendWithTimeout('updateCartItem', dto);
  }

  clearCart(userId: string) {
    return this.sendWithTimeout('clearCart', userId);
  }

  removeExpiredCartItems(userId: string) {
    return this.sendWithTimeout('removeExpiredCartItems', userId);
  }
}