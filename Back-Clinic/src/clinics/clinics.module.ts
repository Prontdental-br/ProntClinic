import { Module } from '@nestjs/common';
import { ClinicsController } from './clinics.controller';
import { ClinicsService } from './clinics.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Clinic } from './entities/clinic.entity';
import { Treatment } from 'src/treatments/entities/treatment.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { AccountsService } from 'src/accounts/accounts.service';
import { Account } from 'src/accounts/entities/account.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { AsaasSubscriptionService } from 'src/asaas-subscription/asaas-subscription.service';
import { PromotionalCodeService } from 'src/promotional-code/promotional-code.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Clinic, Treatment, Specialty, Account]),
  ],
  controllers: [ClinicsController],
  providers: [
    ClinicsService,
    AccountsService,
    TenantModelService,
    AsaasSubscriptionService,
    PromotionalCodeService
  ],
})
export class ClinicsModule {}
