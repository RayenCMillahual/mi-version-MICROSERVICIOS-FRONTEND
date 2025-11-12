// its-gateway/src/controllers/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody 
} from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { AuthResponseDto, RegisterResponseDto } from '../auth/dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Registrar nuevo usuario',
    description: 'Crea una nueva cuenta de usuario en el sistema'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario creado exitosamente',
    type: RegisterResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'password must be longer than or equal to 6 characters'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Usuario ya existe',
    schema: {
      example: {
        statusCode: 409,
        message: 'User already exists',
        error: 'Conflict'
      }
    }
  })
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario y devuelve un JWT token'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciales inválidas',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized'
      }
    }
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}