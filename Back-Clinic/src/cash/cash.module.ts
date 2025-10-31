import { Module } from '@nestjs/common';
import { CashService } from './cash.service';
import { CashController } from './cash.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Cash } from './entities/cash.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [SequelizeModule.forFeature([Cash])],
  providers: [CashService, TenantModelService],
  controllers: [CashController],
})
export class CashModule {}
