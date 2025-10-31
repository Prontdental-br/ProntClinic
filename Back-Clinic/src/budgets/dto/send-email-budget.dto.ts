import { IsEmail, IsUUID } from 'class-validator';

export class SendEmailBudgetDto {
  @IsEmail()
  email: string;

  @IsUUID()
  contractId: string;
  
}
