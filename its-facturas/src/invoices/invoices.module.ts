import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { envs } from '../config/envs';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    ClientsModule.register([
      {
        name: 'MS_USER',
        transport: Transport.TCP,
        options: envs.gateway,
      },
    ]),
  ],
  providers: [InvoicesService],
  controllers: [InvoicesController],
  exports: [InvoicesService],
})
export class InvoicesModule {}