import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { CartModule } from './cart/cart.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, UsersModule, CartModule],
})
export class AppModule {}