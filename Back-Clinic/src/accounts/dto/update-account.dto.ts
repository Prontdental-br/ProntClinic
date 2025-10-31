import { IsEmail, IsPhoneNumber, ValidateIf } from 'class-validator';

export class UpdateAccountDto {
  @ValidateIf((object, value) => value !== null)
  description: string | null;

  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ValidateIf((object, value) => value !== null)
  consultationTime: number | null;

  @ValidateIf((object, value) => value !== null)
  @IsPhoneNumber('BR', { message: 'Formato de telefone inválido' })
  cellPhone: string;

  @ValidateIf((object, value) => value !== null)
  hourly: string;

  active?: boolean;

  expiredSubscription?: boolean;

  expiresIn?: number;

  @ValidateIf((object, value) => value !== null && value.length === 1)
  planType: string;
}
