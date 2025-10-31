import { PartialType } from '@nestjs/mapped-types';
import { ClinicDto } from './clinic.dto';
export class UpdateClinicDto extends PartialType(ClinicDto) {}
