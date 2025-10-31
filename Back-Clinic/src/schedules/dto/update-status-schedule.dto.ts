import { StatusEnum } from '../entities/schedule.entity';
import { IsEnum } from 'class-validator';

export class UpdateStatusScheduleDto {
  @IsEnum(StatusEnum)
  status: StatusEnum;
}
