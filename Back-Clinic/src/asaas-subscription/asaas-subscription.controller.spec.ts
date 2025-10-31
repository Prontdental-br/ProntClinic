import { Test, TestingModule } from '@nestjs/testing';
import { AsaasSubscriptionController } from './asaas-subscription.controller';

describe('AsaasSubscriptionController', () => {
  let controller: AsaasSubscriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsaasSubscriptionController],
    }).compile();

    controller = module.get<AsaasSubscriptionController>(
      AsaasSubscriptionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
