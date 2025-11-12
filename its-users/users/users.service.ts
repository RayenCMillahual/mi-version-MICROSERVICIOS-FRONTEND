import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (exists) throw new ConflictException('Username already exists');

    const hashed = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({ data: { ...dto, password: hashed } });
  }

  findAll() {
    return this.prisma.user.findMany({ select: { id: true, username: true, email: true, createdAt: true } });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return { ...user, password: undefined };
  }

  async update(id: string, dto: UpdateUserDto) {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
  }

  async validateUser(username: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) return null;
    const match = await bcrypt.compare(pass, user.password);
    if (!match) return null;
    // omit password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}