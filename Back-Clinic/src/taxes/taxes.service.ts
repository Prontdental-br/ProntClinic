import { BadRequestException, Injectable } from '@nestjs/common';
import CreateTax from './dto/create-tax';
import { Taxes } from './entities/taxes.entity';
import { InjectModel } from '@nestjs/sequelize';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import BulkCreateTaxes from './dto/bulk-create-taxes';
import { UUIDV4 } from 'sequelize';

@Injectable()
export class TaxesService {
  constructor(
    @InjectModel(Taxes) private taxesModel: typeof Taxes,
    private tenantService: TenantService,
  ) {}

  create(createTax: CreateTax) {
    return this.taxesModel.create({
      ...createTax,
      accountId: this.tenantService.tenant.id,
    });
  }

  bulkCreate(bulkCreateTax: BulkCreateTaxes) {

    console.log(bulkCreateTax);

    const data = bulkCreateTax.data.map((element) => {
      if (typeof element.installment !== 'number' || isNaN(element.installment)) {
        throw new BadRequestException(`Formato de parcela invalido:  ${element.installment}`);
      }
  
      return {
        installment: Number(element.installment),
        percentValue: Number(element.percentValue), 
        accountId: this.tenantService.tenant.id,
      };
    });
  
    console.log('Data:', data);
  
    return this.taxesModel.bulkCreate(data, {
      updateOnDuplicate: ['id'],
    });
  }

  findAll() {
    return this.taxesModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
      },
      order: [['installment', 'ASC']],
    });
  }
}
