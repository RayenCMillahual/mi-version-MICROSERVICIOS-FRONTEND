import { Controller, Get, HttpException, Inject, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('MS_USER') private readonly userClient: ClientProxy,
    @Inject('MS_PRODUCT') private readonly productClient: ClientProxy,
    @Inject('MS_INVOICE') private readonly invoiceClient: ClientProxy,
  ) {}

  @Get('users/hello')
  getUserHello() {
    return this.userClient.send('getHello', {}).pipe(
      catchError(err => { throw new HttpException(err, 500); }),
    );
  }

  @Get('products/hello')
  getProductHello() {
    return this.productClient.send('getHello', {}).pipe(
      catchError(err => { throw new HttpException(err, 500); }),
    );
  }

  @Get('invoices/hello')
  getInvoiceHello() {
    return this.invoiceClient.send('getHello', {}).pipe(
      catchError(err => { throw new HttpException(err, 500); }),
    );
  }
}