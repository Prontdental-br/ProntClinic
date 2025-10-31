/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateAnamneseItemDto {
  @IsString()
  question: string;

  @IsString()
  questionType: string;

  @IsOptional()
  @IsString()
  answerOption?: string;

  @IsOptional()
  @IsString()
  answerDesc?: string;

  @IsOptional()
  options?: any;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  seq?: number;
}

export class CreateAnamneseDto {
  @IsUUID()
  anamneseConfigId: string;

  @IsUUID()
  patientId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnamneseItemDto)
  items: CreateAnamneseItemDto[];

  // Outros campos opcionais
  @IsOptional()
  @IsDate()
  dateCreated?: Date;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  currentAnamnese?: boolean;

  @IsOptional()
  @IsString()
  observation?: string;

}
