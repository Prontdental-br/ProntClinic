import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Labs } from './entities/labs.entity';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Sequelize } from 'sequelize-typescript';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Injectable({ scope: Scope.REQUEST })
export class LabsService {
  constructor(
    private sequelize: Sequelize,
    private tenantService: TenantService,
    private tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Labs)
  private readonly LabsModel: typeof Labs;

  @TenantModel(Clinic)
  private readonly clinicModel: typeof Clinic;

  @TenantModel(Patient)
  private readonly patientModel: typeof Patient;

  async findAll() {
    return this.LabsModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
      },
      order: [['updated_at', 'DESC']],
    });
  }

  async findOne(id: string) {
    let contract = await this.LabsModel.findOne({
      where: {
        id,
      },
      include: [
        {
          model: this.patientModel,
          attributes: ['id', 'name', 'phone'],
        },
      ],
    });

    contract = contract.toJSON();
    const { accountId } = contract;
    const clinic = (
      await this.clinicModel.findOne({ where: { accountId } })
    ).toJSON();
    contract['clinic'] = clinic;

    return contract;
  }

  async create(LabsFields) {
    return this.LabsModel.create({
      ...LabsFields,
      accountId: this.tenantService.tenant.id,
    });
  }

  async update(id: string, LabsFields) {
    const transaction = await this.sequelize.transaction();
    try {
      const lab = await this.LabsModel.findOne({
        where: {
          id,
          accountId: this.tenantService.tenant.id,
        },
      });

      if (!lab) {
        throw new NotFoundException('Laborátorio não encontrado');
      }

      await lab.update(LabsFields, { transaction });
      await transaction.commit();
      return lab;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  remove(id: string) {
    return this.LabsModel.destroy({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      },
    });
  }
}
