/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Anamnese } from './entities/anamnese.entity';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { SendEmailAnamneseDto } from './dto/send-email-anamnese.dto';
import { ConfigService } from '@nestjs/config';
import { sendEmail } from 'src/utils/sendEmail';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { SchemasReference } from 'src/schemas_references/entities/schemas_reference.entity';
import { AnamneseConfig } from './entities/anamnese-config.entity';
import { AnamneseConfigItem } from './entities/anamnese-config-item.entity';
import { AnamneseItem } from './entities/anamnese-item.entity';
import { CreateAnamneseConfigDto } from './dto/creat-anamense-config.dto';
import { CreateAnamneseItemDto } from './dto/create-anamnese-config-item.dto';
import { UpdateAnamneseItemDto } from './dto/updated-anamnese-config-tem.dto';
import { CreateAnamneseDto } from './dto/create-anamnese.dto';

@Injectable({ scope: Scope.REQUEST })
export class AnamneseService {
  constructor(
    private configService: ConfigService,
    private tenantService: TenantService,
    private tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Anamnese)
  private readonly AnamneseModel: typeof Anamnese;

  @TenantModel(AnamneseConfig)
  private readonly AnamneseConfigModel: typeof AnamneseConfig;

  @TenantModel(AnamneseConfigItem)
  private readonly AnamneseConfigItemModel: typeof AnamneseConfigItem;

  @TenantModel(AnamneseItem)
  private readonly AnamneseItemModel: typeof AnamneseItem;

  @TenantModel(Clinic)
  private readonly clinicModel: typeof Clinic;

  @TenantModel(Patient)
  private readonly patientModel: typeof Patient;

  async createConfig(data: CreateAnamneseConfigDto): Promise<AnamneseConfig> {
    const config = await this.AnamneseConfigModel.create({
      desc: data.desc,
      accountId: this.tenantService.tenant.id,
      active: data.active,
      // templateId: data.templateId,
      userCreated: this.tenantService.userTenant.id,
    });

    const items = data.items.map((item) => ({
      ...item,
      anamneseConfigId: config.id,
      accountId: this.tenantService.tenant.id,
      userCreated: this.tenantService.userTenant.id,
    }));

    await this.AnamneseConfigItemModel.bulkCreate(items);

    return config;
  }

  async getConfig(): Promise<AnamneseConfig[]> {
    return this.AnamneseConfigModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
      },
      include: [
        {
          model: this.AnamneseConfigItemModel,
          as: 'items',
        },
      ],
      order: [
        ['created_at', 'DESC'],
        [{ model: this.AnamneseConfigItemModel, as: 'items' }, 'seq', 'ASC'],
      ],
    });
  }

  async addQuestionConfig(configId: string, data: CreateAnamneseItemDto) {
    return this.AnamneseConfigItemModel.create({
      ...data,
      anamneseConfigId: configId,
      accountId: this.tenantService.tenant.id,
    });
  }

  async updateQuestionConfig(itemId: string, data: UpdateAnamneseItemDto) {
    const item = await this.AnamneseConfigItemModel.findOne({
      where: {
        id: itemId,
        accountId: this.tenantService.tenant.id,
      },
    });

    if (!item) {
      throw new NotFoundException('Pergunta não encontrada');
    }

    await item.update(data);
    return item;
  }

  async deleteQuestionConfig(id: string) {
    const item = await this.AnamneseConfigItemModel.findOne({
      where: {
        id,
        accountId: this.tenantService.tenant.id,
      },
    });

    if (!item) {
      throw new NotFoundException('Pergunta não encontrada');
    }

    await item.destroy();
    return { success: true };
  }

  async deleteConfig(id: string) {
    const config = await this.AnamneseConfigModel.findOne({
      where: {
        id,
        accountId: this.tenantService.tenant.id,
      },
      include: [this.AnamneseConfigItemModel],
    });

    if (!config) {
      throw new NotFoundException('Modelo de anamnese não encontrado');
    }

    await this.AnamneseConfigItemModel.destroy({
      where: {
        anamneseConfigId: id,
      },
    });

    await config.destroy();

    return { success: true };
  }

  async findAll(patientId: string) {
    return this.AnamneseModel.findAll({
      where: {
        patientId,
        accountId: this.tenantService.tenant.id,
      },
      include: [
        {
          model: this.patientModel,
          attributes: ['id', 'name', 'email', 'cellPhone'],
        },
        {
          model: this.AnamneseConfigModel,
          as: 'config',
          attributes: ['desc'],
        },
        {
          model: this.AnamneseItemModel,
          as: 'items',
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async findOne(id: string) {
    const schemaReference = await SchemasReference.findOne({
      where: {
        id_reference: id,
        type: 'anamnese',
      },
    });

    console.log('schemaReference', schemaReference);

    if (!schemaReference) {
      throw new NotFoundException('Anamnese não encontrada');
    }

    const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${schemaReference.id_schema}`;

    const AnamneseModel = Anamnese.schema(schemaName);
    const PatientModel = Patient.schema(schemaName);
    const ClinicModel = Clinic.schema(schemaName);
    const AnamneseItemModel = AnamneseItem.schema(schemaName);
    const AnamneseConfigModel = AnamneseConfig.schema(schemaName);

    let anamnese = await AnamneseModel.findOne({
      where: {
        id,
      },
      include: [
        {
          model: PatientModel,
          attributes: ['id', 'name', 'cellPhone', 'cpf', 'email'],
        },
        {
          model: AnamneseItemModel,
          as: 'items',
        },
        {
          model: AnamneseConfigModel,
          as: 'config',
          attributes: ['desc'],
        },
      ],
    });

    if (!anamnese) {
      throw new NotFoundException('Anamnese não encontrada');
    }

    anamnese = anamnese.toJSON();

    const { accountId } = anamnese;

    const clinic = await ClinicModel.findOne({ where: { accountId } });

    anamnese['clinic'] = clinic?.toJSON?.() ?? null;

    return anamnese;
  }

  async updateAnamnese(id: string, items: any[]) {
    const schemaReference = await SchemasReference.findOne({
      where: {
        id_reference: id,
        type: 'anamnese',
      },
    });

    if (!schemaReference) {
      throw new NotFoundException('Anamnese não encontrada');
    }

    const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${schemaReference.id_schema}`;

    const AnamneseModel = Anamnese.schema(schemaName);
    const AnamneseItemModel = AnamneseItem.schema(schemaName);

    const anamnese = await AnamneseModel.findOne({
      where: { id },
    });

    if (!anamnese) {
      throw new NotFoundException('Anamnese não encontrada');
    }

    // Atualiza os itens da anamnese
    if (items && Array.isArray(items)) {
      await AnamneseItemModel.destroy({
        where: { anamneseId: id },
      });

      const itemsToCreate = items.map((item) => ({
        ...item,
        anamneseId: id,
        userCreated: null,
        accountId: schemaReference.accountId,
      }));

      await AnamneseItemModel.bulkCreate(itemsToCreate);
    }

    return anamnese;
  }

  async sendAnamneseByEmail(sendEmailAnamneseFields: SendEmailAnamneseDto) {
    const anamnese = await this.findOne(sendEmailAnamneseFields.contractId);

    const patient = anamnese.patient.name;
    const subject = 'Assinatura Anamnese Clairis';

    const bodyMessage = `Olá ${patient}, você possui uma Anamnese para assinar

Acesse o link abaixo e assine digitalmente.

${this.configService.get('URL_FRONT')}/anamnese/print/${anamnese.id}

Clairis Software`;

    if (anamnese) {
      await sendEmail(sendEmailAnamneseFields.email, subject, bodyMessage);
    }

    return anamnese;
  }

  async create(anamneseFields: CreateAnamneseDto): Promise<Anamnese> {
    const { items, observation, ...rest } = anamneseFields;

    const anamnese = await this.AnamneseModel.create({
      ...rest,
      observation,
      accountId: this.tenantService.tenant.id,
      userCreated: this.tenantService.userTenant.id,
      dateCreated: new Date(),
    });

    await SchemasReference.create({
      accountId: this.tenantService.tenant.id,
      id_reference: anamnese.id,
      id_schema: this.tenantService.tenant.idSeq,
      type: 'anamnese',
    });

    if (items && Array.isArray(items)) {
      const itemsToCreate = items.map((item) => ({
        ...item,
        anamneseId: anamnese.id,
        userCreated: this.tenantService.userTenant.id,
        accountId: this.tenantService.tenant.id,
      }));

      await this.AnamneseItemModel.bulkCreate(itemsToCreate);
    }

    const anamneseWithPatient = await anamnese.reload({
      include: [
        {
          model: this.patientModel,
          attributes: ['name', 'cell_phone'],
        },
      ],
    });

    return anamneseWithPatient;
  }

  async remove(id: string) {
    const anamnese = await this.AnamneseModel.destroy({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      },
    });

    await SchemasReference.destroy({
      where: {
        id_reference: id,
        type: 'anamnese',
      },
    });

    return anamnese;
  }

  async editConfigName(id: string, desc: string) {
    const config = await this.AnamneseConfigModel.findByPk(id);
    if (!config) {
      throw new NotFoundException('Configuração de anamnese não encontrada.');
    }

    config.desc = desc;
    await config.save();

    return config;
  }
}
