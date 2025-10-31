import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Whatsapp } from './entities/whatsapp.entity';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { WhatsAppGateway } from './whatsapp.gateway';

@Module({
  imports: [SequelizeModule.forFeature([Whatsapp])],
  controllers: [WhatsappController],
  providers: [WhatsappService, TenantModelService, WhatsAppGateway],
})
export class WhatsappModule {}
