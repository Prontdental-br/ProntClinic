import { PartialType } from '@nestjs/mapped-types';
import { CreateSchemasReferenceDto } from './create-schemas_reference.dto';

export class UpdateSchemasReferenceDto extends PartialType(CreateSchemasReferenceDto) {}
