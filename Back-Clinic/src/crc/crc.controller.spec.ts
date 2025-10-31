import { Test, TestingModule } from '@nestjs/testing';
import { CrcController } from './crc.controller';
import { CrcService } from './crc.service';

describe('CrcController', () => {
  let controller: CrcController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrcController],
      providers: [CrcService],
    }).compile();

    controller = module.get<CrcController>(CrcController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
