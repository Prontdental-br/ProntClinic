import { IsISO8601 } from 'class-validator';
import { DateTime } from 'luxon';

export class CreateEvolutionDto {
  patientId: string;
  professionalId: string;

  @IsISO8601()
  dateEvolution: DateTime;

  description: string;
}
