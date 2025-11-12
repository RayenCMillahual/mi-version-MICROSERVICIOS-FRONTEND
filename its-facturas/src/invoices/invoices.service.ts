import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @Inject('MS_USER') private readonly userClient: ClientProxy,
  ) {}

  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    const total = dto.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const created = new this.invoiceModel({ ...dto, total });
    return created.save();
  }

  async findAll(): Promise<any[]> {
    const invoices = await this.invoiceModel.find().exec();
    
    // Enriquecer con información de usuarios
    const enrichedInvoices = await Promise.all(
      invoices.map(async (invoice) => {
        try {
          const user = await firstValueFrom(
            this.userClient.send('findOneUser', invoice.userId)
          );
          return {
            ...invoice.toObject(),
            userInfo: {
              username: user.username,
              email: user.email,
            },
          };
        } catch (error) {
          return {
            ...invoice.toObject(),
            userInfo: {
              username: 'Unknown',
              email: 'Unknown',
            },
          };
        }
      })
    );

    return enrichedInvoices;
  }

  async findOne(id: string): Promise<any> {
    const invoice = await this.invoiceModel.findById(id).exec();
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);

    // Enriquecer con información del usuario
    try {
      const user = await firstValueFrom(
        this.userClient.send('findOneUser', invoice.userId)
      );
      return {
        ...invoice.toObject(),
        userInfo: {
          username: user.username,
          email: user.email,
        },
      };
    } catch (error) {
      return {
        ...invoice.toObject(),
        userInfo: {
          username: 'Unknown',
          email: 'Unknown',
        },
      };
    }
  }

  async findByUserId(userId: string): Promise<Invoice[]> {
    return this.invoiceModel.find({ userId }).exec();
  }

  async update(id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    const updateData: Partial<Invoice> = { ...dto };
  
    if (dto.items) {
      updateData.total = dto.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    }
  
    const updated = await this.invoiceModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  
    if (!updated) throw new NotFoundException(`Invoice ${id} not found`);
    return updated;
  }
  
  async remove(id: string): Promise<void> {
    const result = await this.invoiceModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Invoice ${id} not found`);
  }
}