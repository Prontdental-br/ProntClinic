import { Test, TestingModule } from '@nestjs/testing';
import { SchemasReferencesService } from './schemas_references.service';

describe('SchemasReferencesService', () => {
  let service: SchemasReferencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchemasReferencesService],
    }).compile();

    service = module.get<SchemasReferencesService>(SchemasReferencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
