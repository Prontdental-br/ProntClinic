import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MedicinesController } from './medicines.controller';
import { MedicinesService } from './medicines.service';
import { Medicines } from './entities/medicines.entity';

@Module({
  imports: [SequelizeModule.forFeature([Medicines])],
  controllers: [MedicinesController],
  providers: [MedicinesService],
})
export class MedicinesModule {}
