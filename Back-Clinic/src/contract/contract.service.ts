/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, Query, Scope } from '@nestjs/common';

import { Contract } from './entities/contract.entity';

import { TenantService } from 'src/tenant/tenant/tenant.service';
import { Clinic } from 'src/clinics/entities/clinic.entity';

import { Patient } from 'src/patients/entities/patient.entity';
import { Sequelize } from 'sequelize-typescript';
import { SendEmailContractDto } from './dto/send-email-contract.dto';
import { ConfigService } from '@nestjs/config';
import { sendEmail } from 'src/utils/sendEmail';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { SchemasReference } from 'src/schemas_references/entities/schemas_reference.entity';

@Injectable({ scope: Scope.REQUEST })
export class ContractService {
  constructor(
    private sequelize: Sequelize,
    private configService: ConfigService,
    private tenantService: TenantService,
    private tenantModelService: TenantModelService
  ) {}

  @TenantModel(Contract)
  private readonly ContractModel: typeof Contract

  @TenantModel(Patient)
  private readonly patientModel: typeof Patient

  @TenantModel(Clinic)
  private readonly clinicModel: typeof Clinic

  async findAll(patientId: string) {
    return this.ContractModel.findAll({
      where: {
        patientId,
        accountId: this.tenantService.tenant.id,
      },
      include: [
        {
          model: this.patientModel,
          attributes: ['id', 'name', 'cellPhone', 'email'],
        },
      ],
      order: [['updated_at', 'DESC']],
    });
  }

  async findOne(id: string) {
     const schemaReference = await SchemasReference.findOne({
          where: {
            id_reference: id,
            type: 'contract',
          },
        });
  
        if (!schemaReference) {
          throw new NotFoundException('Reference not found');
        }
    
        const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${schemaReference.id_schema}`;
    
        const ContractM = Contract.schema(schemaName);
        const PatientModel = Patient.schema(schemaName);
        const ClinicModel = Clinic.schema(schemaName);

    let contract = await ContractM.findOne({
      where: {
        id,
      },
      include: [
        {
          model: PatientModel,
          attributes: ['id', 'name', 'cellPhone', 'cpf'],
        },
      ],
    });

    contract = contract.toJSON();
    const { accountId } = contract;
    const clinic = (await ClinicModel.findOne({ where: { accountId } })).toJSON();
    contract['clinic'] = clinic;

    return contract;
  }

  async create(ContractFields) {
  const contract = await this.ContractModel.create({
      ...ContractFields,
      accountId: this.tenantService.tenant.id,
    });

    await SchemasReference.create({
          accountId: this.tenantService.tenant.id,
          id_reference: contract.id,
          id_schema: this.tenantService.tenant.idSeq,
          type: 'contract',
    });

    return contract;
  }

  async sendContractToEmail(sendEmailContractFields: SendEmailContractDto) {
      const contract = await this.findOne(sendEmailContractFields.contractId);

      const patient = contract.patient.name;

      const subject = 'Assinatura Contrato Clairis'

      const bodyMessage = `Olá, ${patient}, você possui o contrato ${contract.title} para assinar

Acesse o link abaixo e assine digitalmente.

${this.configService.get('URL_FRONT')}/contract/print/${contract.id}/

Clairis Software` 

    if(contract) {
        await sendEmail(sendEmailContractFields.email, subject, bodyMessage);
    }

    return contract
  }

 async remove(id: string) {
   const contract = await this.ContractModel.destroy({
     where: {
       id: id,
       accountId: this.tenantService.tenant.id,
      },
    });

    await SchemasReference.destroy({
      where: {
        id_reference: id,
        type: 'contract',
      },
    });

    return contract 
}
}
