import { Injectable, Scope } from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { InjectModel } from '@nestjs/sequelize';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { Specialty } from './entities/specialty.entity';
import { Treatment } from 'src/treatments/entities/treatment.entity';
import { Budget } from 'src/budgets/entities/budget.entity';
import { BudgetItem } from 'src/budget-items/entities/budget-item.entity';
import { Sequelize } from 'sequelize';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Injectable({ scope: Scope.REQUEST })
export class SpecialtyService {
  constructor(
    private tenantService: TenantService,
    private readonly tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Specialty)
  private readonly specialtyModel: typeof Specialty;

  create(createSpecialtyDto: CreateSpecialtyDto) {
    return this.specialtyModel.create({
      ...createSpecialtyDto,
      accountId: this.tenantService.tenant.id,
    });
  }

  findAll() {
    return this.specialtyModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        deleted: false, 
      },
      order: [['created_at', 'DESC']],
    });
  }
  findOne(id: string) {
    return this.specialtyModel.findOne({
      where: {
        id,
        accountId: this.tenantService.tenant.id,
      },
    });
  }

  update(id, updateSpecialtyDto: UpdateSpecialtyDto) {
    console.log('updateSpecialtyDto', updateSpecialtyDto);
    return this.specialtyModel.update(
      {
        ...updateSpecialtyDto,
      },
      {
        where: {
          id: id,
          accountId: this.tenantService.tenant.id,
        },
      },
    );
  }

  async remove(id) {
    let treatments: any = await Treatment.findAll({
      where: { specialty_id: id, accountId: this.tenantService.tenant.id },
    });
    treatments = treatments.map((t: any) => t.id);

    await BudgetItem.destroy({
      where: {
        treatment_id: treatments,
        accountId: this.tenantService.tenant.id,
      },
    });
    const resp = await Treatment.destroy({
      where: { specialty_id: id, accountId: this.tenantService.tenant.id },
    });

    console.log(resp);

    return await this.specialtyModel.update(
      { deleted: true }, 
      {
        where: {
          id: id,
          accountId: this.tenantService.tenant.id,
        },
      }
    );
}

}

