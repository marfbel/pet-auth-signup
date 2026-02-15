import { Test, TestingModule } from '@nestjs/testing';
import { EntrypointController } from './entrypoint.controller';
import { EntrypointService } from './entrypoint.service';

describe('EntrypointController', () => {
  let controller: EntrypointController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntrypointController],
      providers: [EntrypointService],
    }).compile();

    controller = module.get<EntrypointController>(EntrypointController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
