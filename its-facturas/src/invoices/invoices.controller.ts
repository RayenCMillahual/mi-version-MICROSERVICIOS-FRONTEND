import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly service: InvoicesService) {}

  @MessagePattern('createInvoice')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Payload() dto: CreateInvoiceDto) {
    return this.service.create(dto);
  }

  @MessagePattern('findAllInvoices')
  findAll() {
    return this.service.findAll();
  }

  @MessagePattern('findOneInvoice')
  findOne(@Payload() id: string) {
    return this.service.findOne(id);
  }

  @MessagePattern('updateInvoice')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  update(@Payload() data: { id: string; dto: UpdateInvoiceDto }) {
    return this.service.update(data.id, data.dto);
  }
  @MessagePattern('findInvoicesByUserId')
findByUserId(@Payload() userId: string) {
  return this.service.findByUserId(userId);
}

  @MessagePattern('removeInvoice')
  remove(@Payload() id: string) {
    return this.service.remove(id);
  }
}