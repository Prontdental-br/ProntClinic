import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Account } from 'src/accounts/entities/account.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Contract } from './entities/contract.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [SequelizeModule.forFeature([Contract, Account, Patient])],
  controllers: [ContractController],
  providers: [ContractService, TenantModelService],
})
export class ContractModule {}
