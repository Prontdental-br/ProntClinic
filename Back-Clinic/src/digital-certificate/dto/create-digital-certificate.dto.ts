import { IsNotEmpty, IsUUID, IsString } from 'class-validator';

export class CreateDigitalCertificateDto {
  @IsUUID()
  @IsNotEmpty()
  professionalId: string; 

  @IsString()
  @IsNotEmpty()
  password: string;
}
