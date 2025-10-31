import { Module } from '@nestjs/common';
import { WebHookController } from './webhook.controller';
import { PaymentScoreConsultationService } from 'src/score-plans/payment-score-consultation.service';
import { AsaasSubscriptionService } from 'src/asaas-subscription/asaas-subscription.service';
import { AccountsService } from 'src/accounts/accounts.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Account } from 'src/accounts/entities/account.entity';
import { PromotionalCodeService } from 'src/promotional-code/promotional-code.service';

@Module({
  imports: [SequelizeModule.forFeature([Account])],
  controllers: [WebHookController],
  providers: [
    PaymentScoreConsultationService,
    AsaasSubscriptionService,
    AccountsService,
    PromotionalCodeService
  ], 
})
export class WebHookModule {}
