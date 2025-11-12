import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { envs } from './config/envs';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',  // CORREGIDO: Antes usabas envs.gateway.host
        port: envs.port,
      },
    },
  );
  await app.listen();
  console.log(`Facturas MS listening on ${envs.port}`);
}
bootstrap();