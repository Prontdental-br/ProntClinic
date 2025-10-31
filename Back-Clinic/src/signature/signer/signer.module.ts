import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Signer } from './entities/signer.entity';
import { SignerController } from './signer.controller';
import { SignerService } from './signer.service';
import { ContractSignature } from '../contract/entities/contractSignature.entity';
import { Prescription } from 'src/prescription/entities/prescription.entity';
import { Certificate } from 'src/certificate/entities/certificate.entity';
import { Budget } from 'src/budgets/entities/budget.entity';
import { Contract } from 'src/contract/entities/contract.entity';
import { Anamnese } from 'src/anamnese/entities/anamnese.entity';
import { Evolution } from 'src/evolutions/entities/evolution.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Signer,
      ContractSignature,
      Prescription,
      Certificate,
      Budget,
      Contract,
      Anamnese,
      Evolution,
    ]),
  ],
  controllers: [SignerController],
  providers: [SignerService, TenantModelService],
})
export class SignerModule {}
