import { Module } from '@nestjs/common';
import { QuotePlanService } from './quote-plan.service';
import { QuotePlanController } from './quote-plan.controller';
import { QuotePlan } from './entities/quote-plan.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([QuotePlan])],
  controllers: [QuotePlanController],
  providers: [QuotePlanService],
})
export class QuotePlanModule {}
