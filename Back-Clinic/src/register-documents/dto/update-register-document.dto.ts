import { PartialType } from '@nestjs/mapped-types';
import { CreateRegisterDocumentDto } from './create-register-document.dto';

export class UpdateRegisterDocumentDto extends PartialType(CreateRegisterDocumentDto) {}
