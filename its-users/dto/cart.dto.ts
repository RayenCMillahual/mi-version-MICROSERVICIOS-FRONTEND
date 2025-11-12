import { IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @IsString()
  userId: string;

  @IsString()
  productId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class RemoveFromCartDto {
  @IsString()
  userId: string;

  @IsString()
  productId: string;
}

export class UpdateCartItemDto {
  @IsString()
  userId: string;

  @IsString()
  productId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}