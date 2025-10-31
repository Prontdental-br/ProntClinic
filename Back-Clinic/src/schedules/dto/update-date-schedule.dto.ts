import { IsISO8601 } from 'class-validator';
import { DateTime } from 'luxon';

export class UpdateDateScheduleDto {
  @IsISO8601()
  startDate: DateTime;

  @IsISO8601()
  endDate: DateTime;
}
