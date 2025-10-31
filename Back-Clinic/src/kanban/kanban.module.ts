import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { KanbanService } from './kanban.service';
import { KanbanController } from './kanban.controller';
import { KanbanLabel } from './entities/kanban-label.entity';
import { KanbanTask } from './entities/kanban-task.entity';
import { KanbanColumn } from './entities/kanban-column.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [
    SequelizeModule.forFeature([KanbanColumn, KanbanTask, KanbanLabel]),
  ],
  providers: [KanbanService, TenantModelService],
  controllers: [KanbanController],
})
export class KanbanModule {}
