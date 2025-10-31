/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateScoreConsultationDto } from './create-score-consult.dto';

export class UpdateScoreConsultationDto extends PartialType(CreateScoreConsultationDto) {}
