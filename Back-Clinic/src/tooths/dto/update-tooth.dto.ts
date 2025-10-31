import { PartialType } from '@nestjs/mapped-types';
import { CreateToothDto } from './create-tooth.dto';

export class UpdateToothDto extends PartialType(CreateToothDto) {}
