import { Injectable, Scope } from '@nestjs/common';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { Treatment } from './entities/treatment.entity';
import { InjectModel } from '@nestjs/sequelize';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { TenantException } from 'src/tenant/exception/TenantException';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { Specialty } from 'src/specialty/entities/specialty.entity';

@Injectable({ scope: Scope.REQUEST })
export class TreatmentsService {
  constructor(
    private tenantService: TenantService,
    private readonly tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Treatment)
  private readonly treatmentModel: typeof Treatment;

  @TenantModel(Specialty)
  private readonly specialtyModel: typeof Specialty;

  create(createTreatmentDto: CreateTreatmentDto) {
    return this.treatmentModel.create({
      ...createTreatmentDto,
      accountId: this.tenantService.tenant.id,
    });
  }

  async findAll() {
    return this.treatmentModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
        deleted: false,
      },
      include: [
        {
          model: this.specialtyModel,
          required: true, 
          where: { deleted: false },
        },
      ],
      order: [['updated_at', 'DESC']],
    });
  }

  async findOne(id: string) {
    const budget = await this.treatmentModel.findByPk(id, {
      rejectOnEmpty: true,
    });
    if (budget.accountId != this.tenantService.tenant.id) {
      throw new TenantException();
    }
    return budget;
  }

  update(id: string, updateTreatmentDto: UpdateTreatmentDto) {
    return this.treatmentModel.update(updateTreatmentDto, {
      where: {
        id,
        accountId: this.tenantService.tenant.id,
      },
    });
  }

  async remove(id: string) {
    return this.treatmentModel.update(
      { deleted: true },
      {
        where: {
          id,
          accountId: this.tenantService.tenant.id,
        },
      },
    );
  }
}
