import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { Contact } from './entities/contact.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [SequelizeModule.forFeature([Contact])],
  providers: [ChatService, TenantModelService],
  controllers: [ChatController],
})
export class ChatModule {}
