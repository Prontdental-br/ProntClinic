/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { plainAddPlaceholder, SignPdf } from 'node-signpdf';
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class PdfSignService {
  async signPdf(pdfBuffer: Buffer, certBuffer: Buffer, password: string): Promise<Buffer> {
    try { 
      const pdfWithPlaceholder = plainAddPlaceholder({
        pdfBuffer,
        reason: 'Assinado digitalmente',
      });

      return new SignPdf().sign(pdfWithPlaceholder, certBuffer, { passphrase: password });
    } catch (error) {
      console.error('Erro ao assinar o PDF:', error);
      throw new BadRequestException('Erro ao assinar o documento.');
    }
  }

async insertQrCodeIntoPdf(pdfBuffer: Buffer, qrBuffer: Buffer): Promise<Buffer> {

   const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBuffer));

   const qrImage = await pdfDoc.embedPng(new Uint8Array(qrBuffer));

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  const { width } = firstPage.getSize();
  const qrSize = 100;

  firstPage.drawImage(qrImage, {
    x: width - qrSize - 50, 
    y: 50, 
    width: qrSize,
    height: qrSize,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
}
