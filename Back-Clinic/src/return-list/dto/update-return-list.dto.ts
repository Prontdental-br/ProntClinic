import { PartialType } from '@nestjs/mapped-types';
import { CreateReturnListDto } from './create-return-list.dto';

export class UpdateReturnListDto extends PartialType(CreateReturnListDto) {}
