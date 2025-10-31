import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SequelizeModule } from '@nestjs/sequelize';
import {Settings} from './entities/settings.entity';

@Module({
  imports: [SequelizeModule.forFeature([Settings])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService]
})
export class SettingsModule {}
