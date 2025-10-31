import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Schedule } from './entities/schedule.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { ScheduleTag } from './entities/schedule.tag.entity';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import { SettingsService } from 'src/settings/settings.service';
import { Settings } from 'src/settings/entities/settings.entity';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { Whatsapp } from 'src/whatsapp/entities/whatsapp.entity';
import { SseService } from './sse.service';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { WhatsAppGateway } from 'src/whatsapp/whatsapp.gateway';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Schedule,
      Account,
      ScheduleTag,
      Clinic,
      Settings,
      Whatsapp,
    ]),
  ],
  controllers: [SchedulesController],
  providers: [
    SchedulesService,
    SettingsService,
    WhatsappService,
    WhatsAppGateway,
    SseService,
    TenantModelService,
  ],
  exports: [SseService],
})
export class SchedulesModule {}
