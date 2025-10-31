import { Module } from '@nestjs/common';
import { CrcService } from './crc.service';
import { CrcController } from './crc.controller';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  controllers: [CrcController],
  providers: [CrcService, TenantModelService],
})
export class CrcModule {}
