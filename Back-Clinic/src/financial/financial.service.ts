import { Injectable, Scope } from '@nestjs/common';
import { Financials } from './entities/financial.entity';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { TenantModel } from 'src/common/decorators/tenant.decorators';

@Injectable({ scope: Scope.REQUEST })
export class FinancialService {
  constructor(
    private tenantService: TenantService,
    private tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Financials)
  private readonly FinancialsModel: typeof Financials;

  async findAll() {
    return this.FinancialsModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
      },
      order: [['updatedAt', 'DESC']],
    });
  }

  async create(fields) {
    return this.FinancialsModel.create({
      ...fields,
      accountId: this.tenantService.tenant.id,
    });
  }

  remove(id: string) {
    return this.FinancialsModel.destroy({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      },
    });
  }
}
