/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AsaasSubscriptionService } from './asaas-subscription.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Controller('asaas-subscription')
@UseGuards(TenantGuard)
@UseGuards(AccessTokenGuard)
export class AsaasSubscriptionController {
  constructor(
    private readonly asaasSubscriptionService: AsaasSubscriptionService,
  ) {}

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get('pending-payment')
  async getPendingPayment() {
    return await this.asaasSubscriptionService.getPaymentPending();
  }

  @Post('generate-payment')
  async generatePayment(
    @Body() body: { accountId: string; method: 'CREDIT_CARD' | 'PIX' },
  ) {
    const invoiceUrl =
      await this.asaasSubscriptionService.generatePaymentByMethod(
        body.accountId,
        body.method,
      );
    return invoiceUrl;
  }

  @Put()
  async update(@Body() data: UpdateSubscriptionDto) {
    const invoiceUrl = await this.asaasSubscriptionService.updateSubscription(
      data,
    );
    if (invoiceUrl) {
      return { paymentUrl: invoiceUrl };
    }
  }
}
