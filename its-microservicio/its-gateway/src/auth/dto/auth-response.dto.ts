// its-gateway/src/auth/dto/auth-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT Token de acceso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  access_token!: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'ID del usuario creado',
    example: '507f1f77bcf86cd799439011'
  })
  id!: string;

  @ApiProperty({
    description: 'Username del usuario',
    example: 'johndoe'
  })
  username!: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'john@example.com'
  })
  email!: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-06-22T20:30:00.000Z'
  })
  createdAt!: Date;
}