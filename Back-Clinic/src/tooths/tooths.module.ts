import { Module } from '@nestjs/common';
import { ToothsService } from './tooths.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Tooth } from './entities/tooth.entity';

@Module({
  imports: [SequelizeModule.forFeature([Tooth])],
  controllers: [],
  providers: [ToothsService],
})
export class ToothsModule {}
