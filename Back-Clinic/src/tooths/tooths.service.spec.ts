import { Test, TestingModule } from '@nestjs/testing';
import { ToothsService } from './tooths.service';

describe('ToothsService', () => {
  let service: ToothsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ToothsService],
    }).compile();

    service = module.get<ToothsService>(ToothsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
