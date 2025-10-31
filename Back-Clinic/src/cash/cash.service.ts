import { Injectable, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateCashDto } from './dto/create-cash.dto';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { Cash } from './entities/cash.entity';
import { UpdateCashDto } from './dto/update-cash.dto';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { TenantModel } from 'src/common/decorators/tenant.decorators';

@Injectable({ scope: Scope.REQUEST })
export class CashService {
  constructor(
    private tenantService: TenantService,
    private readonly tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Cash)
  private readonly cashModel: typeof Cash;

  create(createCashDto: CreateCashDto) {
    return this.cashModel.create({
      ...createCashDto,
      accountId: this.tenantService.tenant.id,
    });
  }

  findAll() {
    return this.cashModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
      },
    });
  }

  update(id: string, updateCashDto: UpdateCashDto) {
    return this.cashModel.update(
      {
        ...updateCashDto,
      },
      {
        where: {
          id: id,
          accountId: this.tenantService.tenant.id,
        },
      },
    );
  }

  remove(id: string) {
    return this.cashModel.destroy({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      },
    });
  }
}
