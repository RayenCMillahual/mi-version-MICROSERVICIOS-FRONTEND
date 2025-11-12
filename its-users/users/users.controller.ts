import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('getHello')
  getHello() {
    return { msg: 'Usuarios MS OK' };
  }

  @MessagePattern('createUser')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  createUser(@Payload() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @MessagePattern('findAllUsers')
  findAllUsers() {
    return this.usersService.findAll();
  }

  @MessagePattern('findOneUser')
  findOneUser(@Payload() id: string) {
    return this.usersService.findOne(id);
  }

  @MessagePattern('updateUser')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  updateUser(@Payload() data: { id: string; dto: UpdateUserDto }) {
    return this.usersService.update(data.id, data.dto);
  }

  @MessagePattern('removeUser')
  removeUser(@Payload() id: string) {
    return this.usersService.remove(id);
  }

  @MessagePattern('validateUser')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  validateUser(@Payload() dto: LoginUserDto) {
    return this.usersService.validateUser(dto.username, dto.password);
  }
}