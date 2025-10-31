import { IsString, IsBoolean, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRegisterDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  description1?: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsUUID()
  userCreated?: string;
}