import { IsEmail, IsUUID } from 'class-validator';

export class SendEmailEvolutionDto {
  @IsEmail()
  email: string;

  @IsUUID()
  contractId: string;
  
}
