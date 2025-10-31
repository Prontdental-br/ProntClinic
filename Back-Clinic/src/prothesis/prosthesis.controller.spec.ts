import { Test, TestingModule } from '@nestjs/testing';
import { ProsthesisController } from './prosthesis.controller';
import { ProsthesisService } from './prosthesis.service';

describe('ProsthesisController', () => {
  let controller: ProsthesisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProsthesisController],
      providers: [ProsthesisService],
    }).compile();

    controller = module.get<ProsthesisController>(ProsthesisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
