import { PartialType } from '@nestjs/mapped-types';
import { CreateQuotePlanDto } from './create-quote-plan.dto';

export class UpdateQuotePlanDto extends PartialType(CreateQuotePlanDto) {}
