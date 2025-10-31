import { Test, TestingModule } from '@nestjs/testing';
import { AsaasSubscriptionService } from './asaas-subscription.service';

describe('AsaasSubscriptionService', () => {
  let service: AsaasSubscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsaasSubscriptionService],
    }).compile();

    service = module.get<AsaasSubscriptionService>(AsaasSubscriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
