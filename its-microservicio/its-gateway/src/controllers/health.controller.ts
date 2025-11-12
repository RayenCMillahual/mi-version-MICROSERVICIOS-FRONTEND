// 6. HEALTH CHECK ENDPOINT (its-gateway/src/controllers/health.controller.ts)
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'API Gateway',
    };
  }

  @Get('microservices')
  async checkMicroservices() {
    // Aquí puedes agregar lógica para verificar la salud de los microservicios
    return {
      status: 'OK',
      services: {
        users: 'UP',
        products: 'UP', 
        invoices: 'UP',
      },
      timestamp: new Date().toISOString(),
    };
  }
}