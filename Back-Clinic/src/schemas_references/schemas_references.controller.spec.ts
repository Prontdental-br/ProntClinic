import { Test, TestingModule } from '@nestjs/testing';
import { SchemasReferencesController } from './schemas_references.controller';
import { SchemasReferencesService } from './schemas_references.service';

describe('SchemasReferencesController', () => {
  let controller: SchemasReferencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchemasReferencesController],
      providers: [SchemasReferencesService],
    }).compile();

    controller = module.get<SchemasReferencesController>(
      SchemasReferencesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
