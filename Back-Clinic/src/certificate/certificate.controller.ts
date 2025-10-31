// Certificate.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Certificate } from './entities/certificate.entity';
import { CertificateService } from './certificate.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { UpdateCertificateDto } from './dto/update-certificate.dto';

@Controller('certificate')
export class CertificateController {
  constructor(private readonly CertificateService: CertificateService) {}

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Certificate> {
    return this.CertificateService.findOne(id);
  }

  @HttpCode(204)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCertificateDto: UpdateCertificateDto,
  ): Promise<void> {
    await this.CertificateService.update(id, updateCertificateDto);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get(':patientId?')
  async findAll(@Query('patientId') patientId: string): Promise<Certificate[]> {
    console.log('patientId', patientId);
    return this.CertificateService.findAll(patientId);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post()
  async create(
    @Body() CertificateFields: CreateCertificateDto,
  ): Promise<Certificate> {
    console.log(CertificateFields);
    return this.CertificateService.create(CertificateFields);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.CertificateService.remove(id);
  }
}
