import { Test, TestingModule } from '@nestjs/testing';
import { CrcService } from './crc.service';

describe('CrcService', () => {
  let service: CrcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrcService],
    }).compile();

    service = module.get<CrcService>(CrcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
