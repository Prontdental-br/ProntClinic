import { Test, TestingModule } from '@nestjs/testing';
import { QuotePlanService } from './quote-plan.service';

describe('QuotePlanService', () => {
  let service: QuotePlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuotePlanService],
    }).compile();

    service = module.get<QuotePlanService>(QuotePlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
