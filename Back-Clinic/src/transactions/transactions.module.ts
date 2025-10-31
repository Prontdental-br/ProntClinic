import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transaction } from './entities/transaction.entity';
import { Budget } from 'src/budgets/entities/budget.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [SequelizeModule.forFeature([Transaction, Budget])],
  controllers: [TransactionsController],
  providers: [TransactionsService, TenantModelService],
})
export class TransactionsModule {}
