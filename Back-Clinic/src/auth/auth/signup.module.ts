/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReserveAccount } from 'src/accounts/entities/reserve_accounts';
import { User } from 'src/users/entities/user.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { SignUpProcessor } from './signup.processor';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Account, ReserveAccount]),
    BullModule.registerQueue({
      name: 'signUpQueue',
      connection: {
        url: process.env.CACHE_REDIS_URI,
      },
    }),
  ],
  providers: [SignUpProcessor],
  exports: [BullModule], 
})
export class SignUpModule {}