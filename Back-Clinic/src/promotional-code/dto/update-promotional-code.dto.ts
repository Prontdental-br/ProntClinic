import { PartialType } from '@nestjs/mapped-types';
import { CreatePromotionalCodeDto } from './create-promotional-code.dto';

export class UpdatePromotionalCodeDto extends PartialType(CreatePromotionalCodeDto) {}
