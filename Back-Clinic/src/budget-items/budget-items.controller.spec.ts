import { Test, TestingModule } from '@nestjs/testing';
import { BudgetItemsController } from './budget-items.controller';
import { BudgetItemsService } from './budget-items.service';

describe('BudgetItemsController', () => {
  let controller: BudgetItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetItemsController],
      providers: [BudgetItemsService],
    }).compile();

    controller = module.get<BudgetItemsController>(BudgetItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
