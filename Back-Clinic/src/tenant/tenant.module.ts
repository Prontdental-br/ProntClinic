import { Global, Module } from '@nestjs/common';
import { TenantService } from './tenant/tenant.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Account } from 'src/accounts/entities/account.entity';
import { User } from 'src/users/entities/user.entity';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([Account, User])],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
