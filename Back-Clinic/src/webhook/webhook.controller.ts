/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { AccountsService } from 'src/accounts/accounts.service';
import { AsaasSubscriptionService } from 'src/asaas-subscription/asaas-subscription.service';
import { PaymentScoreConsultationService } from 'src/score-plans/payment-score-consultation.service';

@Controller('webhook')
export class WebHookController {
  constructor(
    private readonly paymentScoreConsultationService: PaymentScoreConsultationService,
    private readonly asaasSubscriptionService: AsaasSubscriptionService,
  ) {}
  
  @Post()
  async create(@Body() data: any) {

    if (data.event.startsWith('SUBSCRIPTION')) {
      await this.asaasSubscriptionService.handleSubscriptionStatusUpdate(data);
      return { message: 'Dados recebidos relacionados a SUBSCRIPTION', data };
    }
  
     let externalReference: any = {};
      try {
        if (data.payment.externalReference) {
          externalReference = JSON.parse(data.payment.externalReference);
        }
      } catch (e) {
        console.warn('Erro ao fazer parse de externalReference:', e);
        externalReference = {};
      }

    if (data.event.startsWith('PAYMENT_') && externalReference.type === 'score') {
        await this.paymentScoreConsultationService.handlePaymentStatusUpdate(data);
        return { message: 'Pagamento de consulta score processado', data };
    }

    if (data.event.startsWith('PAYMENT_') && data.payment.subscription !== null) {
      await this.asaasSubscriptionService.handleSubscriptionStatusUpdate(data);
      return { message: 'Dados recebidos relacionados a pagamento', data };
    }


  
    await this.paymentScoreConsultationService.handlePaymentStatusUpdate(data);
  
    return { message: 'Dados recebidos com sucesso', data };
  }
}
