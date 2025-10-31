import { Module } from '@nestjs/common';
import { SchemasReferencesService } from './schemas_references.service';
import { SchemasReferencesController } from './schemas_references.controller';

@Module({
  controllers: [SchemasReferencesController],
  providers: [SchemasReferencesService],
})
export class SchemasReferencesModule {}
