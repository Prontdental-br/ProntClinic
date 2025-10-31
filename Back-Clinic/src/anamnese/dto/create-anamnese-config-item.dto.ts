/* eslint-disable prettier/prettier */
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsArray,
  IsInt,
} from 'class-validator';

export class CreateAnamneseItemDto {
  @IsInt()
  seq: number;

  @IsString()
  question: string;

  @IsString()
  questionType: string;

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsBoolean()
  alert?: boolean;

  @IsOptional()
  @IsArray()
  options?: any[];
}
