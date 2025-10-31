import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { OpportunityLabel } from './entities/opportunity-label.entity';
import { OpportunityTask } from './entities/opportunity-tasks.entity';
import { OpportunityColumn } from './entities/opportunity-columns.entity';
import { OpportunityService } from './opportunity.service';
import { OpportunityController } from './opportunity.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      OpportunityColumn,
      OpportunityTask,
      OpportunityLabel,
    ]),
  ],
  providers: [OpportunityService, TenantModelService],
  controllers: [OpportunityController],
})
export class OpportunityModule {}
