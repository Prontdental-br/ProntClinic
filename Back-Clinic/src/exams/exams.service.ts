import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Exams } from './entities/exams.entity';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Professional } from 'src/professionals/entities/professional.entity';
import { Labs } from 'src/labs/entities/labs.entity';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { SchemasReference } from 'src/schemas_references/entities/schemas_reference.entity';
import { Account } from 'src/accounts/entities/account.entity';

@Injectable({ scope: Scope.REQUEST })
export class ExamsService {
  constructor(
    private tenantService: TenantService,
    private tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Exams)
  private readonly ExamsModel: typeof Exams;

  @TenantModel(Clinic)
  private readonly clinicModel: typeof Clinic;

  @TenantModel(Professional)
  private readonly professionalModel: typeof Professional;

  @TenantModel(Labs)
  private readonly labsModel: typeof Labs;

  @TenantModel(Patient)
  private readonly patientModel: typeof Patient;

  async findAll(patientId: string) {
    console.log('patientId', patientId);
    return this.ExamsModel.findAll({
      where: {
        patientId,
        accountId: this.tenantService.tenant.id,
      },
      include: [
        {
          model: this.patientModel,
          attributes: ['id', 'name', 'cellPhone'],
        },
        {
          model: this.labsModel,
          attributes: ['id', 'name', 'phone'],
        },
        {
          model: this.professionalModel,
          attributes: ['id', 'name', 'specialty', 'typeCr', 'cro'],
        },
      ],
      order: [['updated_at', 'DESC']],
    });
  }

  async findOne(id: string) {
    const schemaReference = await SchemasReference.findOne({
      where: {
        id_reference: id,
        type: 'exams',
      },
    });

    if (!schemaReference) {
      throw new NotFoundException('Reference not found');
    }

    const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${schemaReference.id_schema}`;

    const ExamsM = Exams.schema(schemaName);
    const PatientModel = Patient.schema(schemaName);
    const ClinicModel = Clinic.schema(schemaName);
    const ProfessionalModel = Professional.schema(schemaName);
    const LabsM = Labs.schema(schemaName);

    let exam = await ExamsM.findOne({
      where: {
        id,
      },
      include: [
        {
          model: LabsM,
          attributes: ['id', 'name', 'phone'],
        },
        {
          model: PatientModel,
          attributes: ['id', 'name'],
        },
        {
          model: ProfessionalModel,
          attributes: ['id', 'name', 'specialty', 'typeCr', 'cro'],
        },
      ],
    });

    exam = exam.toJSON();
    const { accountId } = exam;
    const clinic = (
      await ClinicModel.findOne({ where: { accountId } })
    ).toJSON();
    exam['clinic'] = clinic;

    const account = await Account.findOne({
      where: { id: accountId },
      attributes: [['cell_phone', 'cellPhone']], 
      raw: true,
    });

    if (clinic) {
      clinic.cellPhone = account?.cellPhone || null;
    }

    exam['clinic'] = clinic;

    return exam;
  }

  async create(ExamsFields) {
    const exams = await this.ExamsModel.create({
      ...ExamsFields,
      expiryDate: new Date(ExamsFields.expiryDate),
      manufactureDate: new Date(ExamsFields.manufactureDate),
      accountId: this.tenantService.tenant.id,
    });

    await SchemasReference.create({
      accountId: this.tenantService.tenant.id,
      id_reference: exams.id,
      id_schema: this.tenantService.tenant.idSeq,
      type: 'exams',
    });

    return exams;
  }

  async remove(id: string) {
    const exam = await this.ExamsModel.destroy({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      },
    });

    await SchemasReference.destroy({
      where: {
        id_reference: id,
        type: 'exams',
      },
    });

    return exam;
  }
}
