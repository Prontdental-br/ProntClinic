import { IsNotEmpty } from 'class-validator';

export class CreateClinicDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  docType: string;

  @IsNotEmpty()
  docNumber: string;

  emmitReceiptBy: string;

  whatsappNumber: string;

  whatsappApiUrl: string;

  whatsappApiToken: string;

}
