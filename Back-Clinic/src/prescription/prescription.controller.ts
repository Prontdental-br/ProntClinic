/* eslint-disable prettier/prettier */
// Prescription.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Res,
  Response,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Prescription } from './entities/prescription.entity';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { DigitalCertificateService } from 'src/digital-certificate/digital-certificate.service';
import { PdfSignService } from './pdfSign.service';
import { randomBytes } from 'crypto';
import * as QRCode from 'qrcode';

import { MinioStorageService } from 'src/s3_bucket/storage.service';

@Controller('prescription')
export class PrescriptionController {
  constructor(
    private readonly PrescriptionService: PrescriptionService,
    private readonly DigitalCertificateService: DigitalCertificateService,
    private readonly PdfSignService: PdfSignService,
    private readonly MinioStorageService: MinioStorageService,
  ) {}

@Get('validate')
async validateGovQr(
  @Query('_format') format: string,
  @Query('_secretCode') secretCode: string,
  @Res() res
) {
  const normalizedFormat = format?.replace(' ', '+');

  if (normalizedFormat !== 'application/validador-iti+json' || !secretCode) {
    throw new BadRequestException('Parâmetros inválidos.');
  }

  const prescription = await this.PrescriptionService.findPdfBySecretCode(secretCode);
  if (!prescription?.pdfUrl) {
    console.error('Erro: Documento não encontrado para o secretCode fornecido.');
    throw new NotFoundException('Documento não encontrado.');
  }

  const payload = {
    version: '1.0.0',
    prescription: {
      signatureFiles: [
        { url: prescription.pdfUrl }
      ]
    }
  };

  return res
    .setHeader('Content-Type', 'application/validador-iti+json') // 👈 ITI exige esse content-type
    .json(payload);
}

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Prescription> {
    return this.PrescriptionService.findOne(id);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Get(':patientId?')
  async findAll(
    @Query('patientId') patientId: string,
  ): Promise<Prescription[]> {
    console.log('patientId', patientId);
    return this.PrescriptionService.findAll(patientId);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post()
  async create(
    @Body() prescriptionFields: CreatePrescriptionDto,
  ): Promise<Prescription[]> {
    console.log(prescriptionFields);
    return this.PrescriptionService.create(prescriptionFields);
  }

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.PrescriptionService.remove(id);
  }

// @Post('sign-pdf')
// @UseInterceptors(FileInterceptor('pdf'))
// async signPdf(
//   @UploadedFile() file: Express.Multer.File,
//   @Body() body: { professionalId: string },
//   @Res() res
// ) {
//   if (!file || !body.professionalId) {
//     throw new BadRequestException('Arquivo PDF e profissional são obrigatórios.');
//   }

//   try {
//     // 1. Pega o certificado digital do profissional
//     const certData = await this.DigitalCertificateService.getCertificate(body.professionalId);

//     // 2. Assina o PDF
//     const signedPdf = await this.PdfSignService.signPdf(
//       file.buffer,
//       certData.certificateFile,
//       certData.password
//     );

//     // 3. Gera um secretCode único
//     // const secretCode = randomBytes(6).toString('hex');

//     // const qrUrl = `${process.env.OWN_URL}/prescription/validate?_format=application/validador-iti+json&_secretCode=${secretCode}`;

//     // const dataUrl = await QRCode.toDataURL(qrUrl);
//     // const base64Data = dataUrl.split(',')[1];
//     // const qrBuffer = Buffer.from(base64Data, 'base64');

//     // const pdfWithQr = await this.PdfSignService.insertQrCodeIntoPdf(signedPdf, qrBuffer);

//     // // 7. Gera nome e envia para o MinIO
//     // const fileName = `prescricao-${Date.now()}.pdf`;
//     // const pdfUrl = await this.MinioStorageService.uploadPDF(
//     //   body.professionalId,
//     //   pdfWithQr,
//     //   'application/pdf',
//     //   fileName
//     // );

//     // console.log('PDF enviado para MinIO. URL:', pdfUrl);

//     // 8. Salva a prescrição
//     // await this.PrescriptionService.save({
//     //   professionalId: body.professionalId,
//     //   secretCode,
//     //   pdfUrl,
//     // });

//     // 9. Retorna o PDF final ao usuário
//     res.set({
//       'Content-Type': 'application/pdf',
//       'Content-Disposition': `attachment; filename="${signedPdf}"`,
//     });

//     return res.send(signedPdf);
//   } catch (error) {
//     console.error('Erro ao assinar e processar PDF:', error);
//     throw new BadRequestException('Erro ao assinar e processar o PDF.');
//   }
// }

@Post('sign-pdf')
@UseInterceptors(FileInterceptor('pdf'))
async signPdf(
  @UploadedFile() file: Express.Multer.File,
  @Body() body: { professionalId: string, prescriptionId: string },
  @Res() res
) {
  if (!file || !body.professionalId) {
    throw new BadRequestException('Arquivo PDF e profissional são obrigatórios.');
  }

  try {
    const certData = await this.DigitalCertificateService.getCertificate(body.professionalId);

    const signedPdfOriginal = await this.PdfSignService.signPdf(
      file.buffer,
      certData.certificateFile,
      certData.password
    );

    const signatureCode = 'AUTH-' + Math.random().toString(36).substring(2, 8).toUpperCase(); 

    const fileNameOriginal = `prescricao-${Date.now()}-original.pdf`;
    const pdfUrlOriginal = await this.MinioStorageService.uploadPDF(
      body.professionalId,
      signedPdfOriginal,
      'application/pdf',
      fileNameOriginal
    );

    console.log('PDF assinado original enviado para MinIO. URL:', pdfUrlOriginal);

    // 🔑 Gerar secretCode único
    const secretCode = Math.random().toString(36).substring(2, 12);

    // 🔒 Salvar no banco a relação secretCode -> pdfUrlOriginal
    await this.PrescriptionService.saveMapping(body.prescriptionId, secretCode, pdfUrlOriginal, signatureCode);

    // 🔗 URL do QR Code no padrão ITI
    const qrUrl = `${process.env.OWN_URL}/prescription/validate?_format=application/validador-iti+json&_secretCode=${secretCode}`;

    const dataUrl = await QRCode.toDataURL(qrUrl);

    return res.json({
      qrUrl,
      qrCodeBase64: dataUrl,
    });

  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    throw new BadRequestException('Erro ao processar a assinatura.');
  }
}









  @HttpCode(204)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  ): Promise<void> {
    await this.PrescriptionService.update(id, updatePrescriptionDto);
  }
}
