import { Test, TestingModule } from '@nestjs/testing';
import { PromotionalCodeService } from './promotional-code.service';

describe('PromotionalCodeService', () => {
  let service: PromotionalCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromotionalCodeService],
    }).compile();

    service = module.get<PromotionalCodeService>(PromotionalCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
