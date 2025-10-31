/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from "@nestjs/common";
import { ScorePlanPayment } from "./entities/score-plans-payment.entity";
import { Clinic } from "src/clinics/entities/clinic.entity";

@Injectable()
export class PaymentScoreConsultationService {
    async handlePaymentStatusUpdate(data: any) {
  const paymentData = data?.payment;

  if (!paymentData || !paymentData.id || !paymentData.status) {
    console.warn('Dados de pagamento ausentes ou inválidos no webhook:', paymentData);
    return { message: 'Dados de pagamento incompletos ou inválidos.' };
  }

  const paymentId = paymentData.id;
  const status = paymentData.status;

  const payment = await ScorePlanPayment.findOne({
    where: { paymentId },
  });

  if (!payment) {
    throw new NotFoundException('Pagamento não encontrado.');
  }

  payment.status = status;
  await payment.save();

  if (status === 'RECEIVED') {
    const clinic = await Clinic.findOne({
      where: { accountId: payment.accountId },
    });

    if (!clinic) {
      throw new NotFoundException('Clínica não encontrada.');
    }

    clinic.scoreCredit += payment.numberOfConsultations;
    await clinic.save();

    return { message: 'Créditos adicionados à clínica com sucesso' };
  }

  return { message: 'Status do pagamento atualizado com sucesso' };
}

}