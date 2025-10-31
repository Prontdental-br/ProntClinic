/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Prescription } from './entities/prescription.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Sequelize } from 'sequelize-typescript';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

import * as crypto from 'crypto';
import forge from 'node-forge';
import fs from 'fs';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { SchemasReference } from 'src/schemas_references/entities/schemas_reference.entity';

import { Op } from 'sequelize';

@Injectable({ scope: Scope.REQUEST })
export class PrescriptionService {
  constructor(
    private sequelize: Sequelize,
    private tenantService: TenantService,
    private tenantModelService: TenantModelService
  ) {}

  @TenantModel(Prescription)
  private readonly PrescriptionModel: typeof Prescription

  @TenantModel(Patient)
  private readonly patientModel: typeof Patient

  @TenantModel(Clinic)
  private readonly clinicModel: typeof Clinic

  async findAll(patientId: string) {
    return this.PrescriptionModel.findAll({
      where: {
        patientId,
        accountId: this.tenantService.tenant.id,
      },
      include: [
        {
          model: this.patientModel,
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
            type: 'prescription',
          },
        });
      
        if (!schemaReference) {
          throw new NotFoundException('Reference not found');
        }
      
    const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${schemaReference.id_schema}`;

     const ClinicModel = Clinic.schema(schemaName);
     const PatientModel = Patient.schema(schemaName);
     const PrescriptionM = Prescription.schema(schemaName);

    let prescription = await PrescriptionM.findOne({
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

    prescription = prescription.toJSON();
    const { accountId } = prescription;
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
    prescription['clinic'] = clinic;

    return prescription;
  }

  async create(prescriptionFields: CreatePrescriptionDto) {
    const firstEl = prescriptionFields.data.shift();
    const resp = await this.PrescriptionModel.create({
      ...firstEl,
      secondaryPrescData: prescriptionFields.data,
      accountId: this.tenantService.tenant.id,
    });

     await SchemasReference.create({
        accountId: this.tenantService.tenant.id,
        id_reference: resp.id,
        id_schema: this.tenantService.tenant.idSeq,
        type: 'prescription',
      });

    return [resp];
  }

async saveMapping(id: string, secretCode: string, pdfUrl: string, signatureCode: string) {

  console.log('Salvando mapeamento secretCode -> pdfUrl no banco:', { id, secretCode, pdfUrl });

  const schemaReference = await SchemasReference.findOne({
          where: {
            id_reference: id,
            type: 'prescription',
          },
        });
      
        if (!schemaReference) {
          throw new NotFoundException('Reference not found');
        }
      
  const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${schemaReference.id_schema}`;

  const PrescriptionM = Prescription.schema(schemaName);

  const prescription = await PrescriptionM.findByPk(id);

  if (!prescription) {
    throw new NotFoundException(`Prescription ${id} não encontrada`);
  }

  prescription.secretCode = secretCode;
  prescription.pdfUrl = pdfUrl;

  await prescription.save();
    const externalRefData = {
        secretCode: secretCode,
        signatureCode: signatureCode
    };

  schemaReference.externalReferences = JSON.stringify(externalRefData);
  await schemaReference.save();

  return prescription;
}


async findPdfBySecretCode(secretCode: string): Promise<Prescription | null> {
    const searchString = `{"secretCode":"${secretCode}"`;
    
    const schemaReference = await SchemasReference.findOne({
        where: {
            externalReferences: { [Op.like]: `%${searchString}%` },
            type: 'prescription',
        },
    });

    if (!schemaReference) {
        console.log(`[LOG FIND-PDF] FALHA NA ETAPA 1: SchemasReference não encontrado para secretCode: ${secretCode}.`);
        return null;
    }

    const id_schema = schemaReference.id_schema;

   const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${id_schema}`;

    const PrescriptionModelTenant = Prescription.schema(schemaName) as typeof Prescription;

    const prescription = await PrescriptionModelTenant.findOne({
        where: { secretCode },
    });
    
    if (!prescription) {
        console.log(`[LOG FIND-PDF] FALHA NA ETAPA 3: Prescription não encontrada no schema ${schemaName} pelo secretCode '${secretCode}'.`);
        return null;
    }

    return prescription;
}

  async remove(id: string) {
    const prescription = await this.PrescriptionModel.findOne({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      }
    })

    const signedPrescription = prescription.isSigned;
    
    if(signedPrescription) {
        throw new BadRequestException('Você não pode excluir uma receita já assinada');
    }

    const data = await this.PrescriptionModel.destroy({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      },
    });

    await SchemasReference.destroy({  
      where: {
        id_reference: id,
        type: 'prescription',
      },
    });

    return data;
  }

  async update(id: string, prescriptionFields: UpdatePrescriptionDto) {
    const firstEl = prescriptionFields.data.shift();
    return this.PrescriptionModel.update(
      {
        ...firstEl,
        secondaryPrescData: prescriptionFields.data,
      },
      {
        where: {
          id,
        },
      },
    );
  }

  generateDocumentHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  signDocumentHash(hash: string, certificatePath: string, password: string): string {
    const pfxBuffer = fs.readFileSync(certificatePath);
    const p12Asn1 = forge.asn1.fromDer(pfxBuffer.toString('binary'));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
  
    const keyBag = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag][0];
    const privateKey = keyBag.key;
  
    const md = forge.md.sha256.create();
    md.update(hash, 'utf8');
  
    return privateKey.sign(md);
  }


   async save(data: { professionalId: string; secretCode: string; pdfUrl: string }) {
    return this.PrescriptionModel.create({
      professionalId: data.professionalId,
      secretCode: data.secretCode,
      pdfUrl: data.pdfUrl,
    });
  }

  // async findBySecretCode(secretCode: string): Promise<Prescription | null> {
  //   return this.PrescriptionModel.findOne({
  //     where: { secretCode },
  //   });
  // }
}
