import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';

@Injectable()
export class UsersProxyService {
  constructor(
    @Inject('MS_USER') private readonly client: ClientProxy,
  ) {}

  createUser(dto: CreateUserDto) {
    return firstValueFrom(this.client.send('createUser', dto));
  }

  validateUser(dto: LoginDto) {
    return firstValueFrom(this.client.send('validateUser', dto));
  }

  // NUEVO - FALTABA ESTE MÉTODO
  findAllUsers() {
    return firstValueFrom(this.client.send('findAllUsers', {}));
  }

  findOneUser(id: string) {
    return firstValueFrom(this.client.send('findOneUser', id));
  }

  addToCart(dto: any) {
    return firstValueFrom(this.client.send('addToCart', dto));
  }

  getCart(userId: string) {
    return firstValueFrom(this.client.send('getCart', userId));
  }

  removeFromCart(dto: any) {
    return firstValueFrom(this.client.send('removeFromCart', dto));
  }

  updateCartItem(dto: any) {
    return firstValueFrom(this.client.send('updateCartItem', dto));
  }

  clearCart(userId: string) {
    return firstValueFrom(this.client.send('clearCart', userId));
  }

  removeExpiredCartItems(userId: string) {
    return firstValueFrom(this.client.send('removeExpiredCartItems', userId));
  }
}