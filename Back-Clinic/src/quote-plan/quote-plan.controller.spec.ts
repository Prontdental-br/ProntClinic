import { Test, TestingModule } from '@nestjs/testing';
import { QuotePlanController } from './quote-plan.controller';
import { QuotePlanService } from './quote-plan.service';

describe('QuotePlanController', () => {
  let controller: QuotePlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuotePlanController],
      providers: [QuotePlanService],
    }).compile();

    controller = module.get<QuotePlanController>(QuotePlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
