import { PartialType } from '@nestjs/mapped-types';
import { CreateContractConfigDto } from './create-contract-config.dto';

export class UpdateContractConfigDto extends PartialType(
  CreateContractConfigDto,
) {}
