import { Injectable, Scope } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from './entities/plan.entity';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { TenantModel } from 'src/common/decorators/tenant.decorators';

@Injectable({ scope: Scope.REQUEST })
export class PlanService {
  constructor(
    private tenantService: TenantService,
    private readonly tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Plan)
  private readonly planModel: typeof Plan;

  create(createPlanDto: CreatePlanDto) {
    return this.planModel.create({
      ...createPlanDto,
      accountId: this.tenantService.tenant.id,
    });
  }

  findAll() {
    return this.planModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        active: true,
      },
      order: [['created_at', 'DESC']],
    });
  }

  findOne(id: string) {
    return this.planModel.findOne({
      where: {
        id,
        accountId: this.tenantService.tenant.id,
        active: true,
      },
    });
  }

  update(id: string, updatePlanDto: UpdatePlanDto) {
    return this.planModel.update(
      {
        ...updatePlanDto,
      },
      {
        where: {
          id: id,
          accountId: this.tenantService.tenant.id,
          active: true,
        },
      },
    );
  }

  remove(id: string) {
    return this.planModel.update(
      {
        active: false,
      },
      {
        where: {
          id,
          accountId: this.tenantService.tenant.id,
          active: true,
        },
      },
    );
  }
}
