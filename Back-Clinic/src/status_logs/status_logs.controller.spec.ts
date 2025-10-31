import { Test, TestingModule } from '@nestjs/testing';
import { StatusLogsController } from './status_logs.controller';
import { StatusLogsService } from './status_logs.service';

describe('StatusLogsController', () => {
  let controller: StatusLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusLogsController],
      providers: [StatusLogsService],
    }).compile();

    controller = module.get<StatusLogsController>(StatusLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
