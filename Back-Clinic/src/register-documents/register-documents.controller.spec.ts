import { Test, TestingModule } from '@nestjs/testing';
import { RegisterDocumentsController } from './register-documents.controller';
import { RegisterDocumentsService } from './register-documents.service';

describe('RegisterDocumentsController', () => {
  let controller: RegisterDocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegisterDocumentsController],
      providers: [RegisterDocumentsService],
    }).compile();

    controller = module.get<RegisterDocumentsController>(RegisterDocumentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
