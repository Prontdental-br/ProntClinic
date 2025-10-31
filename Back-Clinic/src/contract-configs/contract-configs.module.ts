import { Module } from '@nestjs/common';
import { ContractConfigsService } from './contract-configs.service';
import { ContractConfigsController } from './contract-configs.controller';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { TenantService } from 'src/tenant/tenant/tenant.service';

@Module({
  controllers: [ContractConfigsController],
  providers: [ContractConfigsService, TenantModelService]
})
export class ContractConfigsModule {}
