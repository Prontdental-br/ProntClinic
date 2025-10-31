import { Module } from '@nestjs/common';
import { BudgetItemsService } from './budget-items.service';
import { BudgetItemsController } from './budget-items.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { BudgetItem } from './entities/budget-item.entity';
import { Tooth } from 'src/tooths/entities/tooth.entity';
import { Treatment } from 'src/treatments/entities/treatment.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [SequelizeModule.forFeature([BudgetItem, Treatment])],
  controllers: [BudgetItemsController],
  providers: [BudgetItemsService, TenantModelService],
})
export class BudgetItemsModule {}
