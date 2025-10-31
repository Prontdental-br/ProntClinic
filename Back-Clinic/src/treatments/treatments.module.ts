import { Module } from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { TreatmentsController } from './treatments.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Treatment } from './entities/treatment.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [SequelizeModule.forFeature([Treatment, Specialty])],
  controllers: [TreatmentsController],
  providers: [TreatmentsService, TenantModelService],
})
export class TreatmentsModule {}
