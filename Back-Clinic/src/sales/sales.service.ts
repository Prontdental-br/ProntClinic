import { Injectable, Scope } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sales } from './entities/sale.entity';
import { InjectModel } from '@nestjs/sequelize';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { Patient } from 'src/patients/entities/patient.entity';
import { Clinic } from 'src/clinics/entities/clinic.entity';

@Injectable({ scope: Scope.REQUEST })
export class SalesService {
  constructor(
    @InjectModel(Sales)
    private SalesModel: typeof Sales,
    private tenantService: TenantService,
  ) {}

  async findAll() {
    const sales = await this.SalesModel.findAll({
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

    return sales;
  }

  async update(id: string, updateSalesDto) {
    console.log('updateSalesDto', updateSalesDto);
    const updated = this.SalesModel.update(
      {
        ...updateSalesDto,
      },
      {
        where: {
          id: id,
          accountId: this.tenantService.tenant.id,
        },
      },
    );

    if (!updated) {
      throw new Error('Sales not found');
    }

    return this.findOne(id);
  }

  async findOne(id: string) {
    let sales = await this.SalesModel.findOne({
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

    sales = sales.toJSON();
    const { accountId } = sales;
    const clinic = (await Clinic.findOne({ where: { accountId } })).toJSON();
    sales['clinic'] = clinic;

    return sales;
  }

  async create(SalesFields) {
    return this.SalesModel.create({
      ...SalesFields,
      accountId: this.tenantService.tenant.id,
    });
  }

  remove(id: string) {
    return this.SalesModel.destroy({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      },
    });
  }
}
