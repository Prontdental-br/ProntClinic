/* eslint-disable prettier/prettier */
import { Controller, Post, Get, Delete, Param, UseInterceptors, UploadedFile, Body, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DigitalCertificateService } from './digital-certificate.service';
import { CreateDigitalCertificateDto } from './dto/create-digital-certificate.dto';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';


@Controller('digital-certificate')
export class DigitalCertificateController {
  constructor(private readonly certificateService: DigitalCertificateService) {}

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('cert'))
  async uploadCertificate(@UploadedFile() file: Express.Multer.File, @Body() createCertificateDto: CreateDigitalCertificateDto) {
    return this.certificateService.uploadCertificate(file, createCertificateDto);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get(':professionalId')
  async getCertificate(@Param('professionalId') professionalId: string) {
    return this.certificateService.findById(professionalId);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Delete(':professionalId')
  async deleteCertificate(@Param('professionalId') professionalId: string) {
    return this.certificateService.deleteCertificate(professionalId);
  }
}
