import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { Product } from './entities/product.entity';
import { ProductReservation } from './entities/product-reservation.entity';
import { CleanupService } from './cron/cleanup.service';
import config from '../ormConfig';

@Module({
  imports: [
    TypeOrmModule.forRoot(config), 
    TypeOrmModule.forFeature([Product, ProductReservation]),
    ScheduleModule.forRoot(),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, CleanupService],
})
export class AppModule {}