import { Module } from '@nestjs/common';
import { AsaasSubscriptionController } from './asaas-subscription.controller';
import { AsaasSubscriptionService } from './asaas-subscription.service';
import { AccountsService } from 'src/accounts/accounts.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Account } from 'src/accounts/entities/account.entity';
import { PromotionalCodeService } from 'src/promotional-code/promotional-code.service';

@Module({
  imports: [SequelizeModule.forFeature([Account])],
  controllers: [AsaasSubscriptionController],
  providers: [
    AccountsService, 
    AsaasSubscriptionService, 
    PromotionalCodeService],
  exports: [AsaasSubscriptionService],
})
export class AsaasSubscriptionModule {}
