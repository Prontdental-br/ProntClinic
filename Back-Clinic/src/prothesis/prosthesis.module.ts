import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { ProsthesisColumn } from './entities/prosthesis-columns.entity';
import { ProsthesisTask } from './entities/prosthesis-tasks.entity';
import { ProsthesisLabel } from './entities/prosthesis-label.entity';
import { ProsthesisService } from './prosthesis.service';
import { ProsthesisController } from './prosthesis.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ProsthesisColumn,
      ProsthesisTask,
      ProsthesisLabel,
    ]),
  ],
  providers: [ProsthesisService, TenantModelService],
  controllers: [ProsthesisController],
})
export class ProsthesisModule {}
