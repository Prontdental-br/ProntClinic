import { Module } from '@nestjs/common';
import { ReturnListService } from './return-list.service';
import { ReturnListController } from './return-list.controller';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  controllers: [ReturnListController],
  providers: [ReturnListService, TenantModelService]
})
export class ReturnListModule {}
