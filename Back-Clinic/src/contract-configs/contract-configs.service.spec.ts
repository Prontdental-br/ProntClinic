import { Test, TestingModule } from '@nestjs/testing';
import { ContractConfigsService } from './contract-configs.service';

describe('ContractConfigsService', () => {
  let service: ContractConfigsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContractConfigsService],
    }).compile();

    service = module.get<ContractConfigsService>(ContractConfigsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
