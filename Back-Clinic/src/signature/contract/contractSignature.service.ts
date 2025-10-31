/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { ContractSignature } from './entities/contractSignature.entity';
import { CreateContractSignatureDto } from './dto/create-contractSignature.dto';
import { Contract } from 'src/contract/entities/contract.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { SchemasReference } from 'src/schemas_references/entities/schemas_reference.entity';

@Injectable({ scope: Scope.REQUEST })
export class ContractSignatureService {
  constructor(private tenantModelService: TenantModelService) {}

  @TenantModel(ContractSignature)
  private readonly contractSignatureModel: typeof ContractSignature;

  @TenantModel(Patient)
  private readonly patientModel: typeof Patient;

  @TenantModel(Contract)
  private readonly contractModel: typeof Contract;

  async createContract(data: CreateContractSignatureDto) {
    let numberOfSigners = 0;
    if (data.documentType === 'receita') {
      numberOfSigners = 1;
    } else if (data.documentType === 'atestado') {
      numberOfSigners = 1;
    } else if (data.documentType === 'recibo') {
      numberOfSigners = 1;
    } else if (data.documentType === 'contrato') {
      numberOfSigners = 2;
    } else if (data.documentType === 'anamnese') {
      numberOfSigners = 1;
    } else if (data.documentType === 'evolucao') {
      numberOfSigners = 1;
    } else if (data.documentType === 'orcamento') {
      numberOfSigners = 2;
    } else if (data.documentType === 'exame') {
      numberOfSigners = 1;
    }

    const currentDate = new Date();
    const currentTime = currentDate.toTimeString().split(' ')[0];

    const newContract = await this.contractSignatureModel.create({
      numberOfSigners,
      date: currentDate,
      time: currentTime,
      status: 'pending',
      signer1Id: null,
      signer2Id: null,
      documentType: data.documentType,
      hashDoc: data.hashDoc,
      documentId: data.documentId,
    });

    return newContract;
  }

  async findAllContracts(id: string) {
    const contracts = await this.contractSignatureModel.findAll({
      where: {
        signer1Id: id,
        documentType: 'contrato',
      },
    });

    const formattedContracts = await Promise.all(
      contracts.map(async (contract) => {
        const contractAssociated = await this.contractModel.findOne({
          where: { id: contract.documentId },
          include: [{ model: this.patientModel, as: 'patient' }],
        });

        if (!contractAssociated) {
          return null;
        }

        return {
          id: contract.id,
          documentId: contract.documentId,
          date: contract.date,
          time: contract.time,
          status: contract.status,
          documentType: contract.documentType,
          hashDoc: contract.hashDoc,
          numberOfSigners: contract.numberOfSigners,
          title: contractAssociated?.title || null,
          professionalName: contractAssociated?.professional || null,
          patient: contractAssociated?.patient || null,
        };
      }),
    );

    return formattedContracts.filter((contract) => contract !== null);
  }

  async findContractById(id: string) {
    return await this.contractSignatureModel.findByPk(id);
  }

  async findContractByDocId(docId: string) {
    const schemaReference = await SchemasReference.findOne({
      where: {
        id_reference: docId,
      },
    });

    if (!schemaReference) {
      throw new NotFoundException('Reference not found');
    }

    const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${schemaReference.id_schema}`;

    const contractSignatureModel = ContractSignature.schema(schemaName);

    return await contractSignatureModel.findOne({
      where: {
        documentId: docId,
      },
    });
  }
  async updateContract(contractId: string, signerId: string) {
    const contract = await this.contractSignatureModel.findByPk(contractId);

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado');
    }

    // Atualiza o contrato baseado nos assinantes disponíveis
    if (!contract.signer1Id) {
      contract.signer1Id = signerId;
    } else if (!contract.signer2Id && contract.numberOfSigners === 2) {
      contract.signer2Id = signerId;
    } else {
      throw new Error('Todos os assinantes já assinaram');
    }

    // Verifica se o contrato pode ser marcado como completo
    if (
      contract.signer1Id &&
      (contract.numberOfSigners === 1 || contract.signer2Id)
    ) {
      contract.status = 'completed';
    }

    await contract.save();
    return contract;
  }

  // Deleta um contrato
  async deleteContract(id: string): Promise<number> {
    await SchemasReference.destroy({
      where: {
        id_reference: id,
      },
    });

    return await this.contractSignatureModel.destroy({
      where: { id },
    });
  }
}
