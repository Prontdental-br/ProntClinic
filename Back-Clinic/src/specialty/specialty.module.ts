import { Module } from '@nestjs/common';
import { SpecialtyController } from './specialty.controller';
import { SpecialtyService } from './specialty.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Specialty } from './entities/specialty.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [SequelizeModule.forFeature([Specialty])],
  controllers: [SpecialtyController],
  providers: [SpecialtyService, TenantModelService],
})
export class SpecialtyModule {}
