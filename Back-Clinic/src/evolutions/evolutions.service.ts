/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { CreateEvolutionDto } from './dto/create-evolution.dto';
import { UpdateEvolutionDto } from './dto/update-evolution.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Evolution } from './entities/evolution.entity';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { Professional } from 'src/professionals/entities/professional.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import { SendEmailEvolutionDto } from './dto/send-email-evolution.dto';
import { ConfigService } from '@nestjs/config';
import { sendEmail } from 'src/utils/sendEmail';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { SchemasReference } from 'src/schemas_references/entities/schemas_reference.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Injectable({ scope: Scope.REQUEST })
export class EvolutionsService {
  constructor(
    private tenantService: TenantService,
    private configService: ConfigService,
    private tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Evolution)
  private readonly evolutionModel: typeof Evolution;

  @TenantModel(Patient)
  private readonly patientModel: typeof Patient;

  @TenantModel(Professional)
  private readonly professionalModel: typeof Professional;

  async create(createEvolutionDto: CreateEvolutionDto) {
    const evolution = await this.evolutionModel.create({
      ...createEvolutionDto,
      accountId: this.tenantService.tenant.id,
    });

    await SchemasReference.create({
      accountId: this.tenantService.tenant.id,
      id_reference: evolution.id,
      id_schema: this.tenantService.tenant.idSeq,
      type: 'evolutions',
    });

    return evolution;
  }

  findAll(patientId: string) {
    if (!patientId) throw new BadRequestException('patientId is required');

    return this.evolutionModel.findAll({
      where: {
        // accountId: this.tenantService.tenant.id,
        patientId: patientId,
      },
      order: [['date_evolution', 'DESC']],
      include: [
        {
          model: this.professionalModel,
          attributes: ['id', 'name'],
        },
        {
          model: this.patientModel,
          attributes: ['id', 'name', 'cellPhone', 'email'],
        },
      ],
    });
  }

  async findOne(evolutionId: string) {
    if (!evolutionId) throw new BadRequestException('evolution id is required');

    const schemaReference = await SchemasReference.findOne({
      where: {
        id_reference: evolutionId,
        type: 'evolutions',
      },
    });

    if (!schemaReference) {
      throw new NotFoundException('Reference not found');
    }

    const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${schemaReference.id_schema}`;

    const EvolutionModel = Evolution.schema(schemaName);
    const PatientModel = Patient.schema(schemaName);
    const ClinicModel = Clinic.schema(schemaName);
    const ProfessionalModel = Professional.schema(schemaName);

    let evolution = await EvolutionModel.findOne({
      where: {
        // accountId: this.tenantService.tenant.id,
        id: evolutionId,
      },
      order: [['date_evolution', 'DESC']],
      include: [
        {
          model: ProfessionalModel,
          attributes: ['id', 'name'],
        },
        {
          model: PatientModel,
          attributes: ['id', 'name', 'cellPhone', 'email', 'cpf'],
        },
      ],
    });

    evolution = evolution.toJSON();

    const { accountId } = evolution;
    const clinic = (
      await ClinicModel.findOne({ where: { accountId } })
    ).toJSON();
    evolution['clinic'] = clinic;

    return evolution;
  }

  update(id: string, updateEvolutionDto: UpdateEvolutionDto) {
    return this.evolutionModel.update(
      {
        patientId: updateEvolutionDto.patientId,
        professionalId: updateEvolutionDto.professionalId,
        dateEvolution: updateEvolutionDto.dateEvolution,
        description: updateEvolutionDto.description,
      },
      {
        where: {
          id: id,
          accountId: this.tenantService.tenant.id,
        },
      },
    );
  }

  async sendEvolutionToEmail(sendEmailEvolutionFields: SendEmailEvolutionDto) {
    const evolution = await this.findOne(sendEmailEvolutionFields.contractId);

    const patient = evolution.patient.name;

    const subject = 'Assinatura Evolução Clairis';

    const bodyMessage = `Olá, ${patient}, você possui uma evolução para assinar
      
      Acesse o link abaixo e assine digitalmente.
      
      ${this.configService.get('URL_FRONT')}/evolution/print/${evolution.id}
      
      Clairis Software`;

    if (evolution) {
      await sendEmail(sendEmailEvolutionFields.email, subject, bodyMessage);
    }

    return evolution;
  }

  async remove(id: string) {
    const evolution = await this.evolutionModel.destroy({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      },
    });

    await SchemasReference.destroy({  
      where: {
        id_reference: id,
        type: 'evolutions',
      },
    });

    return evolution
  }
  
}
