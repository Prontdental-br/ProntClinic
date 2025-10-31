/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ContractSignature } from './entities/contractSignature.entity';
import { ContractSignatureController } from './contractSignature.controller';
import { ContractSignatureService } from './contractSignature.service';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [SequelizeModule.forFeature([ContractSignature])], 
  controllers: [ContractSignatureController], 
  providers: [ContractSignatureService, TenantModelService], 
})
export class ContracSignaturetModule {}
