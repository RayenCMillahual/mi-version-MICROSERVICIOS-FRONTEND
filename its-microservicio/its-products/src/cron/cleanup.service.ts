import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private readonly productsService: ProductsService) {}

  // Ejecutar cada 6 horas
  @Cron(CronExpression.EVERY_6_HOURS)
  async cleanupExpiredReservations() {
    this.logger.log('🧹 Starting cleanup of expired reservations...');
    
    try {
      const result = await this.productsService.cleanExpiredReservations();
      this.logger.log(`✅ Cleanup completed: ${result.deletedCount} expired reservations removed`);
    } catch (error) {
      this.logger.error('❌ Error during cleanup:', error);
    }
  }

  // También ejecutar cada día a las 3 AM
  @Cron('0 3 * * *')
  async dailyCleanup() {
    this.logger.log('🌙 Running daily cleanup at 3 AM...');
    await this.cleanupExpiredReservations();
  }
}