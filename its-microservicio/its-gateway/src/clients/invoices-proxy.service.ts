// its-gateway/src/clients/invoices-proxy.service.ts
import { Injectable, Inject, RequestTimeoutException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';

@Injectable()
export class InvoicesProxyService {
  private readonly TIMEOUT_MS = 5000; // 5 segundos

  constructor(
    @Inject('MS_INVOICE') private readonly client: ClientProxy,
  ) {}

  private async sendWithTimeout<T>(pattern: string, data: any): Promise<T> {
    try {
      return await firstValueFrom(
        this.client.send<T>(pattern, data).pipe(
          timeout(this.TIMEOUT_MS),
          catchError((error) => {
            if (error.name === 'TimeoutError') {
              throw new RequestTimeoutException(
                `Invoices service timeout after ${this.TIMEOUT_MS}ms`
              );
            }
            throw error;
          })
        )
      );
    } catch (error) {
      throw error;
    }
  }

  create(dto: any) {
    return this.sendWithTimeout('createInvoice', dto);
  }

  findAll() {
    return this.sendWithTimeout('findAllInvoices', {});
  }

  findByUserId(userId: string) {
    return this.sendWithTimeout('findInvoicesByUserId', userId);
  }

  findOne(id: string) {
    return this.sendWithTimeout('findOneInvoice', id);
  }

  update(id: string, dto: any) {
    return this.sendWithTimeout('updateInvoice', { id, dto });
  }

  remove(id: string) {
    return this.sendWithTimeout('removeInvoice', id);
  }
}