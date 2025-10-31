import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AccessTokenStrategy } from './strategies/access-token-strategy.service';
import { RefreshTokenStrategy } from './strategies/refresh-token-strategy.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/users/entities/user.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { ReserveAccount } from 'src/accounts/entities/reserve_accounts';
import { SignUpModule } from './auth/signup.module';

@Module({
  imports: [
    SignUpModule,
    JwtModule.register({}),
    SequelizeModule.forFeature([Account, User, ReserveAccount]),
  ],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    TenantModelService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
