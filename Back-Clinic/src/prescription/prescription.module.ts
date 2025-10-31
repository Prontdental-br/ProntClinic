import { Module } from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { PrescriptionController } from './prescription.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Prescription } from './entities/prescription.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { PdfSignService } from './pdfSign.service';
import { DigitalCertificate } from 'src/digital-certificate/entities/digital-certificate.entity';
import { DigitalCertificateService } from 'src/digital-certificate/digital-certificate.service';
import { MinioStorageService } from 'src/s3_bucket/storage.service';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Prescription,
      Account,
      Patient,
      DigitalCertificate,
    ]),
  ],
  controllers: [PrescriptionController],
  providers: [
    PrescriptionService,
    PdfSignService,
    DigitalCertificateService,
    MinioStorageService,
    TenantModelService,
  ],
})
export class PrescriptionModule {}
