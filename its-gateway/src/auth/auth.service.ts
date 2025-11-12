import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersProxyService } from '../clients/users-proxy.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersProxy: UsersProxyService,
  ) {}

  async register(dto: any) {
    return this.usersProxy.createUser(dto);
  }

  async login(dto: any) {
    const user = await this.usersProxy.validateUser(dto);
    if (!user) throw new UnauthorizedException();
    const payload = { username: user.username, sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }
}