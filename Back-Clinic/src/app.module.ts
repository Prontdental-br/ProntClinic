/* eslint-disable prettier/prettier */
import { SequelizeModule } from '@nestjs/sequelize';
import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module';
import { SchedulesModule } from './schedules/schedules.module';
import { TagsModule } from './tags/tags.module';
import { ConfigModule } from '@nestjs/config';
import { Account } from './accounts/entities/account.entity';
import { PatientsModule } from './patients/patients.module';
import { ProfessionalsModule } from './professionals/professionals.module';
import { Patient } from './patients/entities/patient.entity';
import { Professional } from './professionals/entities/professional.entity';
import { Schedule } from './schedules/entities/schedule.entity';
import { Tag } from './tags/entities/tag.entity';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { PlanModule } from './plan/plan.module';
import { TreatmentsModule } from './treatments/treatments.module';
import { BudgetsModule } from './budgets/budgets.module';
import { ToothsModule } from './tooths/tooths.module';
import { BudgetItemsModule } from './budget-items/budget-items.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { TransactionsModule } from './transactions/transactions.module';
import { Plan } from './plan/entities/plan.entity';
import { ScheduleTag } from './schedules/entities/schedule.tag.entity';
import { Budget } from './budgets/entities/budget.entity';
import { BudgetItem } from './budget-items/entities/budget-item.entity';
import { Treatment } from './treatments/entities/treatment.entity';
import { EvolutionsModule } from './evolutions/evolutions.module';
import { Evolution } from './evolutions/entities/evolution.entity';
import { Tooth } from './tooths/entities/tooth.entity';
import { ClinicsModule } from './clinics/clinics.module';
import { Clinic } from './clinics/entities/clinic.entity';
import { CashModule } from './cash/cash.module';
import { SpecialtyModule } from './specialty/specialty.module';
import { Specialty } from './specialty/entities/specialty.entity';
import { Stock } from './stock/entities/stock.entity';
import { StockModule } from './stock/stock.module';
import { AnamneseModule } from './anamnese/anamnese.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { CertificateModule } from './certificate/certificate.module';
import { ContractModule } from './contract/contract.module';
import { FilesModule } from './files/files.module';
import { SalesModule } from './sales/sales.module';
import { PaymentModule } from './payment/payment.module';
import { Payment } from './payment/entities/payment.entity';
import { TokensModule } from './tokens/tokens.module';
import { QuotePlanService } from './quote-plan/quote-plan.service';
import { QuotePlanModule } from './quote-plan/quote-plan.module';
import { LabsModule } from './labs/labs.module';
import { ExamsModule } from './exams/exams.module';
import { ReportsModule } from './reports/reports.module';
import { Report } from './reports/entities/report.entity';
import AsaasAccount from './accounts/entities/asaasAcount.entity';
import { SettingsModule } from './settings/settings.module';
import { ScoreModule } from './score-plans/score-plans.module';
import { ScoreConsultationModule } from './score-consult/score-consult.module';
import { WebHookModule } from './webhook/webhook.module';
import { ScorePlans } from './score-plans/entities/score-plans.entity';
import { ScoreConsultation } from './score-consult/entities/score-consult.entity';
import { ScorePlanPayment } from './score-plans/entities/score-plans-payment.entity';
import { MedicinesModule } from './medicines/medicines.module';
import { Medicines } from './medicines/entities/medicines.entity';
import { ContracSignaturetModule } from './signature/contract/contractSignature.module';
import { ContractSignature } from './signature/contract/entities/contractSignature.entity';
import { SignerModule } from './signature/signer/signer.module';
import { Signer } from './signature/signer/entities/signer.entity';
import { FinancialModule } from './financial/financial.module';
import { Financials } from './financial/entities/financial.entity';
import { AsaasSubscriptionService } from './asaas-subscription/asaas-subscription.service';
import { AsaasSubscriptionController } from './asaas-subscription/asaas-subscription.controller';
import { AsaasSubscriptionModule } from './asaas-subscription/asaas-subscription.module';
import { TaxesModule } from './taxes/taxes.module';
import { Taxes } from './taxes/entities/taxes.entity';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { Whatsapp } from './whatsapp/entities/whatsapp.entity';
import { DigitalCertificateModule } from './digital-certificate/digital-certificate.module';
import { DigitalCertificate } from './digital-certificate/entities/digital-certificate.entity';
import { UploadModule } from './s3_bucket/upload.module';
import { KanbanModule } from './kanban/kanban.module';
import { KanbanTask } from './kanban/entities/kanban-task.entity';
import { KanbanColumn } from './kanban/entities/kanban-column.entity';
import { KanbanLabel } from './kanban/entities/kanban-label.entity';
import { SchemasReferencesModule } from './schemas_references/schemas_references.module';
import { SchemasReference } from './schemas_references/entities/schemas_reference.entity';
import { Contact } from './chat/entities/contact.entity';
import { Chat } from './chat/entities/chat.entity';
import { ChatMessage } from './chat/entities/chat-message.entity';
import { ChatModule } from './chat/chat.module';
import { OpportunityModule } from './opportunity/opportunity.module';
import { CrcModule } from './crc/crc.module';
import { StatusLogsModule } from './status_logs/status_logs.module';
import { StatusLog } from './status_logs/entities/status_log.entity';
import { ProsthesisModule } from './prothesis/prosthesis.module';
import { AnamneseConfig } from './anamnese/entities/anamnese-config.entity';
import { AnamneseConfigItem } from './anamnese/entities/anamnese-config-item.entity';
import { AnamneseItem } from './anamnese/entities/anamnese-item.entity';
import { Anamnese } from './anamnese/entities/anamnese.entity';
import { ReserveAccount } from './accounts/entities/reserve_accounts';
import { SignUpModule } from './auth/auth/signup.module';
import { ContractConfigsModule } from './contract-configs/contract-configs.module';
import { ContractConfig } from './contract-configs/entities/contract-config.entity';
import { PromotionalCodeModule } from './promotional-code/promotional-code.module';
import { PromotionalCode } from './promotional-code/entities/promotional-code.entity';
import { PromotionalCodeService } from './promotional-code/promotional-code.service';
import { LogsSystemModule } from './logs-system/logs-system.module';
import { ReturnListModule } from './return-list/return-list.module';
import { ReturnList } from './return-list/entities/return-list.entity';
import { CategoriesModule } from './categories/categories.module';
import { RegisterDocumentsModule } from './register-documents/register-documents.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRoot({
      dialect: process.env.DB_PRONT_CONNECTION as any,
      logging: console.log,
      schema: process.env.DB_PRONT_SCHEMA,
      host: process.env.DB_PRONT_HOST,
      port: parseInt(process.env.DB_PRONT_PORT),
      username: process.env.DB_PRONT_USERNAME,
      password: process.env.DB_PRONT_PASSWORD,
      database: process.env.DB_PRONT_DATABASE,
      dialectOptions: {
        ssl:
          process.env.DB_PRONT_SSL === 'true'
            ? {
                require: true,
                rejectUnauthorized: false,
              }
            : false,
      },
      models: [
        User,
        Stock,
        Account,
        ReserveAccount,
        Patient,
        Professional,
        Schedule,
        ScheduleTag,
        Tag,
        Plan,
        Budget,
        BudgetItem,
        Treatment,
        Evolution,
        Tooth,
        Clinic,
        Specialty,
        Payment,
        AsaasAccount,
        Report,
        ScorePlans,
        ScoreConsultation,
        ScorePlanPayment,
        Medicines,
        ContractSignature,
        Signer,
        Financials,
        Taxes,
        Whatsapp,
        DigitalCertificate,
        KanbanTask,
        KanbanColumn,
        KanbanLabel,
        SchemasReference,
        Contact,
        Chat,
        ChatMessage,
        StatusLog,
        AnamneseConfig,
        AnamneseConfigItem,
        AnamneseItem,
        Anamnese,
        ContractConfig,
        PromotionalCode,
        ReturnList,
      ],
      autoLoadModels: true,
      synchronize: process.env.DB_SYNC === 'true',
      sync: {
        alter: true,
        force: process.env.DB_FORCE_SYNC === 'true',
      },
    }),
    AccountsModule,
    AnamneseModule,
    PrescriptionModule,
    StockModule,
    TagsModule,
    PatientsModule,
    ProfessionalsModule,
    SchedulesModule,
    CommonModule,
    AuthModule,
    TenantModule,
    PlanModule,
    TreatmentsModule,
    BudgetsModule,
    ToothsModule,
    BudgetItemsModule,
    UsersModule,
    TransactionsModule,
    EvolutionsModule,
    ClinicsModule,
    CashModule,
    SpecialtyModule,
    CertificateModule,
    ContractModule,
    LabsModule,
    FilesModule,
    SalesModule,
    PaymentModule,
    TokensModule,
    QuotePlanModule,
    ExamsModule,
    ReportsModule,
    SettingsModule,
    ScoreModule,
    ScoreConsultationModule,
    WebHookModule,
    MedicinesModule,
    ContracSignaturetModule,
    SignerModule,
    FinancialModule,
    AsaasSubscriptionModule,
    TaxesModule,
    WhatsappModule,
    DigitalCertificateModule,
    UploadModule,
    KanbanModule,
    SchemasReferencesModule,
    ChatModule,
    OpportunityModule,
    CrcModule,
    StatusLogsModule,
    ProsthesisModule,
    ContractConfigsModule,
    PromotionalCodeModule,
    LogsSystemModule,
    ReturnListModule,
    CategoriesModule,
    SignUpModule,
    RegisterDocumentsModule,
  ],
  controllers: [AppController, AsaasSubscriptionController],
  providers: [
    AppService,
    QuotePlanService,
    AsaasSubscriptionService,
    PromotionalCodeService,
  ],
})
export class AppModule {}
