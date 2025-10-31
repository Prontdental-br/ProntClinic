import { PartialType } from '@nestjs/mapped-types';
import { CreateCrcDto } from './create-crc.dto';

export class UpdateCrcDto extends PartialType(CreateCrcDto) {}
