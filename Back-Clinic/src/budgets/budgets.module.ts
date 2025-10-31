import { Budget } from './entities/budget.entity';
import { Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { BudgetItem } from 'src/budget-items/entities/budget-item.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Taxes } from 'src/taxes/entities/taxes.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
@Module({
  imports: [
    SequelizeModule.forFeature([
      Budget,
      Account,
      BudgetItem,
      Patient,
      Payment,
      Transaction,
      Taxes,
    ]),
  ],
  controllers: [BudgetsController],
  providers: [BudgetsService, TenantModelService],
})
export class BudgetsModule {}
