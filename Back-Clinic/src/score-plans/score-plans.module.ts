/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScoreController } from './score-plans.controller';
import { ScoreService } from './score-plans.service';
import { ScorePlans } from './entities/score-plans.entity';

@Module({
    imports: [SequelizeModule.forFeature([ScorePlans])],
    controllers: [ScoreController],
    providers: [ScoreService],
})
export class ScoreModule {}