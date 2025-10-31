import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Exams } from './entities/exams.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [SequelizeModule.forFeature([Exams])],
  controllers: [ExamsController],
  providers: [ExamsService, TenantModelService],
})
export class ExamsModule {}
