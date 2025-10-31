import { IsEmail, IsUUID } from 'class-validator';

export class SendEmailContractDto {
  @IsEmail()
  email: string;

  @IsUUID()
  contractId: string;
  
  // Inclua outros campos necessários para o contrato aqui
}
