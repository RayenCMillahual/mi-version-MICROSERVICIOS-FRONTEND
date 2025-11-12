import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { envs } from './config/envs';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    MongooseModule.forRoot(envs.uri),
    InvoicesModule,
  ],
})
export class AppModule {}