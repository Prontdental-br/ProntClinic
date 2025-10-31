import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { StatusEnum } from '../entities/schedule.entity';
import { DateTime } from 'luxon';

export class CreateScheduleDto {
  @IsString()
  type: string;

  @IsISO8601()
  startDate: DateTime;

  @IsISO8601()
  endDate: DateTime;

  @IsNumber()
  duration: number;

  @IsString()
  observation: string;

  @IsBoolean()
  isConfirmed: boolean;

  @IsBoolean()
  isAllDay: boolean;

  @IsBoolean()
  activateReminder: boolean;

  @IsEnum(StatusEnum)
  status: StatusEnum;

  @IsNumber()
  returnIn: number;

  @IsUUID()
  patientId: string;

  @IsUUID()
  professionalId: string;

  treatmentId?: string;

  return?: string;

  tags: string[];

  confirmMessage?: string;

  activeConfirmMessage?: boolean;

  activeNotificationSound?: boolean;

  saveConfirmMessage?: boolean;

  returnTime?: Date;
}
