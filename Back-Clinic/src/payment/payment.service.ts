import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { InjectModel } from '@nestjs/sequelize';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { Patient } from 'src/patients/entities/patient.entity';
import { Clinic } from 'src/clinics/entities/clinic.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment)
    private PaymentModel: typeof Payment,
    private tenantService: TenantService,
  ) {}

  async findAll() {
    const payments = await this.PaymentModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
      },
      include: [
        {
          model: Patient,
          attributes: ['id', 'name'],
        },
      ],
    });

    return payments;
  }

  async update(id: string, updatePaymentDto) {
    console.log('updatePaymentDto', updatePaymentDto);
    const updated = this.PaymentModel.update(
      {
        ...updatePaymentDto,
      },
      {
        where: {
          id: id,
          accountId: this.tenantService.tenant.id,
        },
      },
    );

    if (!updated) {
      throw new Error('Payment not found');
    }

    return this.findOne(id);
  }

  async findOne(id: string) {
    const payments = await this.PaymentModel.findOne({
      where: {
        id,
      },
      include: [
        {
          model: Patient,
          attributes: ['id', 'name'],
        },
      ],
    });

    return payments;
  }

  async create(PaymentFields) {
    return this.PaymentModel.create({
      ...PaymentFields,
      accountId: this.tenantService.tenant.id,
    });
  }

  remove(id: string) {
    return this.PaymentModel.destroy({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      },
    });
  }
}
