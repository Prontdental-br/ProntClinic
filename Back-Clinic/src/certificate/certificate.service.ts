import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Query,
  Scope,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Certificate } from './entities/certificate.entity';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Sequelize } from 'sequelize-typescript';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { SchemasReference } from 'src/schemas_references/entities/schemas_reference.entity';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Injectable({ scope: Scope.REQUEST })
export class CertificateService {
  constructor(
    private sequelize: Sequelize,
    private tenantService: TenantService,
    private tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Certificate)
  private readonly CertificateModel: typeof Certificate;

  @TenantModel(Patient)
  private readonly PatientModel: typeof Patient;

  async findAll(patientId: string) {
    return this.CertificateModel.findAll({
      where: {
        patientId,
        accountId: this.tenantService.tenant.id,
      },
      include: [
        {
          model: this.PatientModel,
          attributes: ['id', 'name', 'cellPhone'],
        },
      ],
      order: [['updated_at', 'DESC']],
    });
  }

  async findOne(id: string) {
    const schemaReference = await SchemasReference.findOne({
      where: {
        id_reference: id,
        type: 'certificate',
      },
    });

    if (!schemaReference) {
      throw new NotFoundException('Anamnese não encontrada');
    }

    const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${schemaReference.id_schema}`;

    const CertificateM = Certificate.schema(schemaName);
    const PatientModel = Patient.schema(schemaName);
    const ClinicModel = Clinic.schema(schemaName);

    let certificate = await CertificateM.findOne({
      where: {
        id,
      },
      include: [
        {
          model: PatientModel,
          attributes: ['id', 'name', 'cellPhone'],
        },
      ],
    });

    certificate = certificate.toJSON();
    const { accountId } = certificate;
    const clinic = (
      await ClinicModel.findOne({
        where: { accountId },
        include: [
          {
            model: Account,
            attributes: ['cellPhone'],
          },
        ],
      })
    ).toJSON();
    certificate['clinic'] = clinic;

    return certificate;
  }

  async create(CertificateFields) {
    const certificate = await this.CertificateModel.create({
      ...CertificateFields,
      accountId: this.tenantService.tenant.id,
    });

    await SchemasReference.create({
      accountId: this.tenantService.tenant.id,
      id_reference: certificate.id,
      id_schema: this.tenantService.tenant.idSeq,
      type: 'certificate',
    });

    return certificate;
  }

  async update(id: string, updateCertificateDto: UpdateCertificateDto) {
    return this.CertificateModel.update(updateCertificateDto, {
      where: {
        id,
      },
    });
  }

  async remove(id: string) {
    const certificate = await this.CertificateModel.findOne({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      },
    });

    const signedCertificate = certificate.isSigned;

    if (signedCertificate) {
      throw new BadRequestException(
        'Você não pode excluir um atestado já assinado!',
      );
    }

    await SchemasReference.destroy({
      where: {
        id_reference: id,
        type: 'certificate',
      },
    });

    return this.CertificateModel.destroy({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      },
    });
  }
}
