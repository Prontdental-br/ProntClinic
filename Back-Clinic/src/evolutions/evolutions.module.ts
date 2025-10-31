import { Module } from '@nestjs/common';
import { EvolutionsService } from './evolutions.service';
import { EvolutionsController } from './evolutions.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Evolution } from './entities/evolution.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [SequelizeModule.forFeature([Evolution])],
  controllers: [EvolutionsController],
  providers: [EvolutionsService, TenantModelService],
})
export class EvolutionsModule {}
