import { Test, TestingModule } from '@nestjs/testing';
import { ReturnListService } from './return-list.service';

describe('ReturnListService', () => {
  let service: ReturnListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReturnListService],
    }).compile();

    service = module.get<ReturnListService>(ReturnListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
