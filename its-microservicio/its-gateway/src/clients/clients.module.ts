import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from '../config/envs';
import { UsersProxyService } from './users-proxy.service';
import { ProductsProxyService } from './products-proxy.service';
import { InvoicesProxyService } from './invoices-proxy.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MS_USER',
        transport: Transport.TCP,
        options: envs.microservices.user,
      },
      {
        name: 'MS_PRODUCT',
        transport: Transport.TCP,
        options: envs.microservices.product,
      },
      {
        name: 'MS_INVOICE',
        transport: Transport.TCP,
        options: envs.microservices.invoice,
      },
    ]),
  ],
  providers: [
    UsersProxyService,
    ProductsProxyService,
    InvoicesProxyService,
  ],
  exports: [
    UsersProxyService,
    ProductsProxyService,
    InvoicesProxyService,
  ],
})
export class GatewayClientsModule {}