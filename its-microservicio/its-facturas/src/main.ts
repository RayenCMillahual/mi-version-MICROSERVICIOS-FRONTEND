// its-facturas/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { envs } from './config/envs';
import { AllExceptionsFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: envs.port,
      },
    },
  );
  
  // ✅ APLICAR FILTRO GLOBAL DE EXCEPCIONES
  app.useGlobalFilters(new AllExceptionsFilter());
  
  await app.listen();
  console.log(`Facturas MS listening on ${envs.port}`);
}
bootstrap();