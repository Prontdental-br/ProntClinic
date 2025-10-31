import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Stock } from './entities/stock.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { LogsSystem } from 'src/logs-system/entities/logs-system.entity';

@Module({
  imports: [SequelizeModule.forFeature([Stock, LogsSystem])],
  controllers: [StockController],
  providers: [StockService, TenantModelService],
})
export class StockModule {}
