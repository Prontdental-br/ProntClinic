import { IsEmail, IsUUID } from 'class-validator';

export class SendEmailAnamneseDto {
  @IsEmail()
  email: string;

  @IsUUID()
  contractId: string;
  
 
}
