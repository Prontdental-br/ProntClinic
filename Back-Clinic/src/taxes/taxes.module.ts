import { Module } from '@nestjs/common';
import { TaxesService } from './taxes.service';
import { TaxesController } from './taxes.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Taxes } from './entities/taxes.entity';

@Module({
  providers: [TaxesService],
  imports: [SequelizeModule.forFeature([Taxes])],
  controllers: [TaxesController],
})
export class TaxesModule {}
