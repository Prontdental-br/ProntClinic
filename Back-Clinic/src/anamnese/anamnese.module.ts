import { Module } from '@nestjs/common';
import { AnamneseService } from './anamnese.service';
import { AnamneseController } from './anamnese.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Anamnese } from './entities/anamnese.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [SequelizeModule.forFeature([Anamnese])],
  controllers: [AnamneseController],
  providers: [AnamneseService, TenantModelService],
})
export class AnamneseModule {}
