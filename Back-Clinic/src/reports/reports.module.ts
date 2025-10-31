import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ExcelService } from './excel.service';
import { Report } from './entities/report.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { Account } from 'src/accounts/entities/account.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { SchedulesService } from 'src/schedules/schedules.service';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { ScheduleTag } from 'src/schedules/entities/schedule.tag.entity';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import { SettingsService } from 'src/settings/settings.service';
import { Settings } from 'src/settings/entities/settings.entity';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Budget } from 'src/budgets/entities/budget.entity';
import { BudgetsService } from 'src/budgets/budgets.service';
import { BudgetItem } from 'src/budget-items/entities/budget-item.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Taxes } from 'src/taxes/entities/taxes.entity';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { Whatsapp } from 'src/whatsapp/entities/whatsapp.entity';
import { SchedulesModule } from 'src/schedules/schedules.module';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { WhatsAppGateway } from 'src/whatsapp/whatsapp.gateway';

@Module({
  imports: [
    SchedulesModule,
    SequelizeModule.forFeature([
      Report,
      Account,
      Transaction,
      Schedule,
      ScheduleTag,
      Clinic,
      Settings,
      Budget,
      BudgetItem,
      Patient,
      Taxes,
      Whatsapp,
    ]),
  ],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ExcelService,
    SchedulesService,
    WhatsappService,
    WhatsAppGateway,
    SettingsService,
    TransactionsService,
    BudgetsService,
    TenantModelService,
  ],
})
export class ReportsModule {}
