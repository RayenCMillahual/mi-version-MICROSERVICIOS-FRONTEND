// its-gateway/src/auth/dto/login.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Username o email del usuario',
    example: 'johndoe'
  })
  @IsString()
  username!: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123'
  })
  @IsString()
  password!: string;
}