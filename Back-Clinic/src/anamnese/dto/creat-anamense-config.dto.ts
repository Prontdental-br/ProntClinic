/* eslint-disable prettier/prettier */
// dto/create-anamnese-config.dto.ts
import {
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAnamneseConfigItemDto {
  @IsString()
  question: string;

  @IsString()
  questionType: string;

  @IsArray()
  options: any[];

  @IsBoolean()
  required: boolean;

  @IsBoolean()
  alert: boolean;

  @IsNumber()
  seq: number;
}

export class CreateAnamneseConfigDto {
  @IsString()
  desc: string;

  @IsBoolean()
  active: boolean;

//   @IsUUID()
//   templateId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnamneseConfigItemDto)
  items: CreateAnamneseConfigItemDto[];
}
