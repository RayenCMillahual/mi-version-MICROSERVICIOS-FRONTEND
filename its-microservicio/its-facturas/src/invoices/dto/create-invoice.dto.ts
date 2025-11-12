import 'reflect-metadata';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsUUID,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID(4, { message: 'productId must be a valid UUID' })
  productId: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'quantity must be an integer' })
  @Min(1)
  quantity: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;
}

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID(4, { message: 'userId must be a valid UUID' })
  userId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Invoice must have at least one item' })
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}