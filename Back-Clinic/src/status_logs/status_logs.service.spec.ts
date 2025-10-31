import { Test, TestingModule } from '@nestjs/testing';
import { StatusLogsService } from './status_logs.service';

describe('StatusLogsService', () => {
  let service: StatusLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusLogsService],
    }).compile();

    service = module.get<StatusLogsService>(StatusLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
