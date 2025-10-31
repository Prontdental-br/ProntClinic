import { Injectable } from '@nestjs/common';
import { CreateSchemasReferenceDto } from './dto/create-schemas_reference.dto';
import { UpdateSchemasReferenceDto } from './dto/update-schemas_reference.dto';

@Injectable()
export class SchemasReferencesService {
  create(createSchemasReferenceDto: CreateSchemasReferenceDto) {
    return 'This action adds a new schemasReference';
  }

  findAll() {
    return `This action returns all schemasReferences`;
  }

  findOne(id: number) {
    return `This action returns a #${id} schemasReference`;
  }

  update(id: number, updateSchemasReferenceDto: UpdateSchemasReferenceDto) {
    return `This action updates a #${id} schemasReference`;
  }

  remove(id: number) {
    return `This action removes a #${id} schemasReference`;
  }
}
