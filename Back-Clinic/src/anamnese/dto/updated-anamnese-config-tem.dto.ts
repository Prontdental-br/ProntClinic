import { IsBoolean, IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateAnamneseItemDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  questionType?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsBoolean()
  alert?: boolean;

  @IsOptional()
  @IsArray()
  options?: any[];
}
