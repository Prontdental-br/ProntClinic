import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RegisterDocumentsService } from './register-documents.service';
import { RegisterDocumentsController } from './register-documents.controller';
import { RegisterDocument } from './entities/register-document.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [
    SequelizeModule.forFeature([RegisterDocument]),
  ],
  controllers: [RegisterDocumentsController],
  providers: [RegisterDocumentsService, TenantModelService],
})
export class RegisterDocumentsModule {}