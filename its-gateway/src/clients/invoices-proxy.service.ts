import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InvoicesProxyService {
  constructor(
    @Inject('MS_INVOICE') private readonly client: ClientProxy,
  ) {}

  create(dto: any) {
    return firstValueFrom(this.client.send('createInvoice', dto));
  }
  findAll() {
    return firstValueFrom(this.client.send('findAllInvoices', {}));
  }
  findByUserId(userId: string) {
  return firstValueFrom(this.client.send('findInvoicesByUserId', userId));
}
  findOne(id: string) {
    return firstValueFrom(this.client.send('findOneInvoice', id));
  }
  update(id: string, dto: any) {
    return firstValueFrom(this.client.send('updateInvoice', { id, dto }));
  }
  remove(id: string) {
    return firstValueFrom(this.client.send('removeInvoice', id));
  }
}