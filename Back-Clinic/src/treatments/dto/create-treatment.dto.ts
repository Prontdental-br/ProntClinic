/* eslint-disable prettier/prettier */
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum TreatmentComplexity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGHT = 'hight',
}
export class CreateTreatmentDto {
  @IsNotEmpty({
    message: 'O nome do tratamento não pode ser vazio',
  })
  name: string;
  descritpion: string;
  @IsNotEmpty({
    message: 'O valor do tratamento não pode ser vazio',
  })
  value: number;
  active: boolean;
  specialtyId: string;
  cost: number;
  contraindications: string;
  @IsEnum(TreatmentComplexity, {
    message: 'O nível complexidade não é valido',
  })
  complexity: string;
}
