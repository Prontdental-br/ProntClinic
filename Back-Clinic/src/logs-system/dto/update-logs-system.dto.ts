import { PartialType } from '@nestjs/mapped-types';
import { CreateLogsSystemDto } from './create-logs-system.dto';

export class UpdateLogsSystemDto extends PartialType(CreateLogsSystemDto) {}
