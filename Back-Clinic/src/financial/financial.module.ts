import { Module } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { FinancialController } from './financial.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Financials } from './entities/financial.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [SequelizeModule.forFeature([Financials])],
  providers: [FinancialService, TenantModelService],
  controllers: [FinancialController],
})
export class FinancialModule {}
