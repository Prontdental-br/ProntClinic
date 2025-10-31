import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SchemasReferencesService } from './schemas_references.service';
import { CreateSchemasReferenceDto } from './dto/create-schemas_reference.dto';
import { UpdateSchemasReferenceDto } from './dto/update-schemas_reference.dto';

@Controller('schemas-references')
export class SchemasReferencesController {
  constructor(
    private readonly schemasReferencesService: SchemasReferencesService,
  ) {}

  @Post()
  create(@Body() createSchemasReferenceDto: CreateSchemasReferenceDto) {
    return this.schemasReferencesService.create(createSchemasReferenceDto);
  }

  @Get()
  findAll() {
    return this.schemasReferencesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schemasReferencesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSchemasReferenceDto: UpdateSchemasReferenceDto,
  ) {
    return this.schemasReferencesService.update(+id, updateSchemasReferenceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schemasReferencesService.remove(+id);
  }
}
