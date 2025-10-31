import { Test, TestingModule } from '@nestjs/testing';
import { RegisterDocumentsService } from './register-documents.service';

describe('RegisterDocumentsService', () => {
  let service: RegisterDocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegisterDocumentsService],
    }).compile();

    service = module.get<RegisterDocumentsService>(RegisterDocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
