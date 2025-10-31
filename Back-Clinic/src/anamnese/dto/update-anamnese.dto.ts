import { PartialType } from '@nestjs/mapped-types';
import { CreateAnamneseDto } from './create-anamnese.dto';

export class UpdatePatientDto extends PartialType(CreateAnamneseDto) {}
