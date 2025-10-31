import { Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export function toDate(value: string): Date | undefined {
  if (!value) return undefined; 
  const date = new Date(value);

  return isNaN(date.getTime()) ? undefined : date; 
}

export class QueryDto {
  @Transform(({ value }) => toDate(value))
  @IsDate()
  @IsOptional()
  public dateStart: Date;

  @Transform(({ value }) => toDate(value))
  @IsDate()
  @IsOptional()
  public dateEnd: Date;

  @IsString()
  @IsOptional()
  public status: string;

  @IsString()
  @IsOptional()
  public professionalIds: string;

  @IsString()
  @IsOptional()
  public patientName: string;
}