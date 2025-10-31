import { IsEnum, IsDateString } from 'class-validator';
enum EmmitReceiptBy {
  clinic = 'clinic',
  professional = 'professional',
  dentist = 'dentist',
  aesthetic = 'aesthetic',
}

export class ClinicDto {
  name: string;
  profilePic: string;
  docType: string;
  docNumber: string;
  communicationName: string;
  responsibleName: string;
  openHour: string;
  closeHour: string;
  @IsEnum(EmmitReceiptBy)
  emmitReceiptBy: string;
  timezone: string;
  cep: string;
  street: string;
  addressNumber: string;
  addressComplement: string;
}
