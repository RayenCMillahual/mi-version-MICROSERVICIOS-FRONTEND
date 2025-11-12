import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { envs } from '../config/envs';
import { GatewayClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: envs.jwt.secret,
      signOptions: { expiresIn: envs.jwt.expiresIn },
    }),
    GatewayClientsModule, // Esta es la línea clave que faltaba
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}