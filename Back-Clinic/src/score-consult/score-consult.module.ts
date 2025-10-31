/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScoreConsultation } from './entities/score-consult.entity';
import { ScoreConsultationController } from './score-consult.controller';
import { ScoreConsultationService } from './score-consult.service';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [SequelizeModule.forFeature([ScoreConsultation])],
  controllers: [ScoreConsultationController],
  providers: [ScoreConsultationService, TenantModelService],
})
export class ScoreConsultationModule {}
