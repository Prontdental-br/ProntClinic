import { Test, TestingModule } from '@nestjs/testing';
import { LogsSystemController } from './logs-system.controller';
import { LogsSystemService } from './logs-system.service';

describe('LogsSystemController', () => {
  let controller: LogsSystemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogsSystemController],
      providers: [LogsSystemService],
    }).compile();

    controller = module.get<LogsSystemController>(LogsSystemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
