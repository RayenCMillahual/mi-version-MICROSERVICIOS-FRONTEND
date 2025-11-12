import { IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @IsString()
  productId: string;

  @IsString()
  userId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CheckStockDto {
  @IsString()
  productId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}