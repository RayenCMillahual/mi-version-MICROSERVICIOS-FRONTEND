import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
@Prop({ type: String, required: true })
userId: string;

  @Prop({
    type: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    default: [],
  })
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];

  @Prop({ required: true, min: 0 })
  total: number;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);