import { Test, TestingModule } from '@nestjs/testing';
import { ReturnListController } from './return-list.controller';
import { ReturnListService } from './return-list.service';

describe('ReturnListController', () => {
  let controller: ReturnListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReturnListController],
      providers: [ReturnListService],
    }).compile();

    controller = module.get<ReturnListController>(ReturnListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
