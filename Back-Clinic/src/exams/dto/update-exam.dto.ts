import { PartialType } from '@nestjs/mapped-types';
import { CreateExamDto } from './create-exam.dto';

export class UpdatePatientDto extends PartialType(CreateExamDto) {}
