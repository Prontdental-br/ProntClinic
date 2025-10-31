import { Test, TestingModule } from '@nestjs/testing';
import { PromotionalCodeController } from './promotional-code.controller';
import { PromotionalCodeService } from './promotional-code.service';

describe('PromotionalCodeController', () => {
  let controller: PromotionalCodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromotionalCodeController],
      providers: [PromotionalCodeService],
    }).compile();

    controller = module.get<PromotionalCodeController>(PromotionalCodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
