/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { DigitalCertificate } from './entities/digital-certificate.entity';
import { DigitalCertificateService } from './digital-certificate.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DigitalCertificateController } from './digital-certificate.controller';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';


@Module({
   imports: [SequelizeModule.forFeature([DigitalCertificate])],
   controllers: [DigitalCertificateController],
   providers: [DigitalCertificateService, TenantModelService],
})
export class DigitalCertificateModule {}
