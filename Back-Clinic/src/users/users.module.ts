import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { AccessTokenStrategy } from 'src/auth/strategies/access-token-strategy.service';
import { RefreshTokenStrategy } from 'src/auth/strategies/refresh-token-strategy.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([User, Account])],
  controllers: [UsersController],
  providers: [UsersService, JwtService],
  exports: [UsersService],
})
export class UsersModule {}
