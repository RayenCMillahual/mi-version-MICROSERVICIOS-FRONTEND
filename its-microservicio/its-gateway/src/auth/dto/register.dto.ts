// its-gateway/src/auth/dto/register.dto.ts
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username del usuario',
    example: 'johndoe',
    minLength: 3
  })
  @IsString()
  @MinLength(3)
  username!: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'john@example.com'
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'John Doe',
    required: false
  })
  @IsOptional()
  @IsString()
  fullName?: string;
}