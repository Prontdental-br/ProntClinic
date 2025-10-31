import {
  IsBoolean,
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
  isNumberString,
} from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty({ message: 'Nome não pode ser vazio' })
  name: string;

  @ValidateIf((object, value) => value !== null)
  description: string | null;

  @ValidateIf((object, value) => value !== null)
  active: boolean | null;

  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsString()
  password: string;

  @ValidateIf((object, value) => value !== null)
  consultationTime: number | null;

  @ValidateIf((object, value) => value !== null)
  @IsPhoneNumber('BR', { message: 'Formato de telefone inválido' })
  cellPhone: string;

  @ValidateIf((object, value) => value !== null)
  hourly: string;

  @ValidateIf((object, value) => value !== null)
  type: string;

  // @IsOptional()
  // @IsUUID()
  // couponId?: string; 
}
