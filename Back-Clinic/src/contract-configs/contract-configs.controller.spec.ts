import { Test, TestingModule } from '@nestjs/testing';
import { ContractConfigsController } from './contract-configs.controller';
import { ContractConfigsService } from './contract-configs.service';

describe('ContractConfigsController', () => {
  let controller: ContractConfigsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractConfigsController],
      providers: [ContractConfigsService],
    }).compile();

    controller = module.get<ContractConfigsController>(ContractConfigsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
