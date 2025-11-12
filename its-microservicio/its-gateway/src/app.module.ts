import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GatewayClientsModule } from './clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { ProductsController } from './controllers/products.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { CartController } from './controllers/cart.controller';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GatewayClientsModule,
    AuthModule,
  ],
  controllers: [
    AuthController,
    UsersController,      // ← AGREGAR ESTA LÍNEA
    ProductsController,
    InvoicesController,
    CartController,
    HealthController,
  ],
})
export class AppModule {}