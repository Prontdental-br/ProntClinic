/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { Signer } from './entities/signer.entity';
import { CreateSignerDto } from './dto/create-signer.dto';
import { ContractSignature } from '../contract/entities/contractSignature.entity';
import { Prescription } from 'src/prescription/entities/prescription.entity';
import { Certificate } from 'src/certificate/entities/certificate.entity';
import { Budget } from 'src/budgets/entities/budget.entity';
import { Contract } from 'src/contract/entities/contract.entity';
import { Anamnese } from 'src/anamnese/entities/anamnese.entity';
import { Evolution } from 'src/evolutions/entities/evolution.entity';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { SchemasReference } from 'src/schemas_references/entities/schemas_reference.entity';
import { Exams } from 'src/exams/entities/exams.entity';

@Injectable({ scope: Scope.REQUEST })
export class SignerService {
  constructor(private tenantModelService: TenantModelService) {}

  @TenantModel(Signer)
  private readonly signerModel: typeof Signer;

  @TenantModel(ContractSignature)
  private contractSignatureModel: typeof ContractSignature;

  @TenantModel(Prescription)
  private prescriptionModel: typeof Prescription;

  @TenantModel(Certificate)
  private certificateModel: typeof Certificate;

  @TenantModel(Budget)
  private budgetModel: typeof Budget;

  @TenantModel(Contract)
  private contractModel: typeof Contract;

  @TenantModel(Anamnese)
  private anamneseModel: typeof Anamnese;

  @TenantModel(Evolution)
  private evolutionModel: typeof Evolution;

  async createSignerAndUpdateContract(
    signerData: CreateSignerDto,
    documentId: string,
  ) {
    const schemaReference = await SchemasReference.findOne({
      where: {
        id_reference: documentId,
      },
    });

    if (!schemaReference) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${schemaReference.id_schema}`;

    const contract = await ContractSignature.schema(schemaName).findOne({
      where: {
        documentId,
      },
    });

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado');
    }

    if (
      contract.signer1Id &&
      (contract.numberOfSigners === 1 || contract.signer2Id)
    ) {
      throw new BadRequestException(
        'Todos os assinantes já assinaram este contrato',
      );
    }

    const signer = await Signer.schema(schemaName).create({
      clinicId: signerData.clinicId,
      signerId: signerData.signerId,
      council: signerData.council,
      numberConcil: signerData.numberCouncil,
      isProfessional: signerData.isProfessional,
      name: signerData.name,
      email: signerData.email,
      cpf: signerData.cpf,
      date: new Date(),
      time: new Date().toTimeString().split(' ')[0],
      hash: signerData.hash,
      imgSignature: signerData.imgSignature,
      fontFamily: signerData.fontFamily,
      accountId: signerData.accountId,
    });

    if (!contract.signer1Id) {
      contract.signer1Id = signer.signerId;
    } else if (!contract.signer2Id && contract.numberOfSigners === 2) {
      contract.signer2Id = signer.signerId;
    }

    if (!contract.hashSigner1) {
      contract.hashSigner1 = signer.hash;
    } else if (!contract.hashSigner2 && contract.numberOfSigners === 2) {
      contract.hashSigner2 = signer.hash;
    }

    if (
      contract.signer1Id &&
      (contract.numberOfSigners === 1 || contract.signer2Id)
    ) {
      contract.status = 'completed';
    } else {
      contract.status = 'pending';
    }

    await contract.save();

    if (contract.documentType === 'receita') {
      const prescription = await Prescription.schema(schemaName).findOne({
        where: {
          id: documentId,
        },
      });

      if (prescription) {
        prescription.date = new Date();
        prescription.time = new Date().toTimeString().split(' ')[0];
        prescription.hash = signerData.hash;
        prescription.email = signerData.email;
        prescription.name = signerData.name;
        prescription.isSigned = true;
        prescription.fontFamily = signerData.fontFamily || 'Default';
        prescription.imgSignature = signerData.imgSignature;

        await prescription.save();
      }
    } else if (contract.documentType === 'atestado') {
      const certificate = await Certificate.schema(schemaName).findOne({
        where: {
          id: documentId,
        },
      });

      if (certificate) {
        certificate.date = new Date();
        certificate.time = new Date().toTimeString().split(' ')[0];
        certificate.hash = signerData.hash;
        certificate.email = signerData.email;
        certificate.name = signerData.name;
        certificate.isSigned = true;
        certificate.fontFamily = signerData.fontFamily || 'Default';
        certificate.imgSignature = signerData.imgSignature;

        await certificate.save();
      }
    } else if (contract.documentType === 'recibo') {
      const budget = await Budget.schema(schemaName).findOne({
        where: {
          id: documentId,
        },
      });

      if (budget) {
        budget.time = new Date().toTimeString().split(' ')[0];
        budget.hash = signerData.hash;
        budget.email = signerData.email;
        budget.name = signerData.name;
        budget.isSigned = true;
        budget.fontFamily = signerData.fontFamily || 'Default';
        budget.imgSignature = signerData.imgSignature;

        await budget.save();
      }
    } else if (contract.documentType === 'contrato') {
      const contract = await Contract.schema(schemaName).findOne({
        where: {
          id: documentId,
        },
      });

      if (contract && signerData.isProfessional && signerData.numberCouncil) {
        contract.time = new Date().toTimeString().split(' ')[0];
        contract.date = new Date();
        contract.hash = signerData.hash;
        contract.email = signerData.email;
        contract.name = signerData.name;
        contract.isSigned = true;
        contract.fontFamily = signerData.fontFamily || 'Default';
        contract.imgSignature = signerData.imgSignature;

        await contract.save();
      }
    } else if (contract.documentType === 'anamnese') {
      const anamnese = await Anamnese.schema(schemaName).findOne({
        where: {
          id: documentId,
        },
      });

      if (anamnese) {
        anamnese.time = new Date().toTimeString().split(' ')[0];
        anamnese.date = new Date();
        anamnese.hash = signerData.hash;
        anamnese.email = signerData.email;
        anamnese.name = signerData.name;
        anamnese.isSigned = true;
        anamnese.fontFamily = signerData.fontFamily || 'Default';

        await anamnese.save();
      }
    } else if (contract.documentType === 'evolucao') {
      const evolution = await Evolution.schema(schemaName).findOne({
        where: {
          id: documentId,
        },
      });

      if (evolution) {
        evolution.time = new Date().toTimeString().split(' ')[0];
        evolution.date = new Date();
        evolution.hash = signerData.hash;
        evolution.email = signerData.email;
        evolution.name = signerData.name;
        evolution.isSigned = true;
        evolution.fontFamily = signerData.fontFamily || 'Default';

        await evolution.save();
      }
    } else if (contract.documentType === 'orcamento') {
      const budget = await Budget.schema(schemaName).findOne({
        where: {
          id: documentId,
        },
      });

      if (budget && signerData.isProfessional && signerData.numberCouncil) {
        budget.time = new Date().toTimeString().split(' ')[0];
        budget.hash = signerData.hash;
        budget.email = signerData.email;
        budget.name = signerData.name;
        budget.isSigned = true;
        budget.fontFamily = signerData.fontFamily || 'Default';
        budget.imgSignature = signerData.imgSignature;

        await budget.save();
      }
    } else if (contract.documentType === 'exame') {
      const certificate = await Exams.schema(schemaName).findOne({
        where: {
          id: documentId,
        },
      });

      if (certificate) {
        certificate.date = new Date();
        certificate.time = new Date().toTimeString().split(' ')[0];
        certificate.hash = signerData.hash;
        certificate.email = signerData.email;
        certificate.name = signerData.name;
        certificate.isSigned = true;
        certificate.fontFamily = signerData.fontFamily || 'Default';
        certificate.imgSignature = signerData.imgSignature;

        await certificate.save();
      }
    }

    return { signer, contract };
  }

  async findAllSigners(): Promise<Signer[]> {
    return this.signerModel.findAll();
  }

  async findSignerById(id: string): Promise<Signer> {
    return this.signerModel.findByPk(id);
  }

  async updateSigner(
    id: string,
    updateData: Partial<Signer>,
  ): Promise<[number, Signer[]]> {
    return this.signerModel.update(updateData, {
      where: { id },
      returning: true,
    });
  }

  async deleteSigner(id: string): Promise<number> {
    return this.signerModel.destroy({
      where: { id },
    });
  }
}
