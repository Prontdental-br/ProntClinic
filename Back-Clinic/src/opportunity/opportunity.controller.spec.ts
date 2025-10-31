import { Test, TestingModule } from '@nestjs/testing';
import { OpportunityController } from './opportunity.controller';
import { OpportunityService } from './opportunity.service';

describe('OpportunityController', () => {
  let controller: OpportunityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpportunityController],
      providers: [OpportunityService],
    }).compile();

    controller = module.get<OpportunityController>(OpportunityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
