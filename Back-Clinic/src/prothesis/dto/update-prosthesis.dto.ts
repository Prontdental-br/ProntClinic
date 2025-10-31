import { PartialType } from '@nestjs/mapped-types';
import { CreateProsthesisDto } from './create-prosthesis.dto';

export class UpdateProsthesisDto extends PartialType(CreateProsthesisDto) {}
