import { Test, TestingModule } from '@nestjs/testing';
import { EntrypointService } from './entrypoint.service';

describe('EntrypointService', () => {
  let service: EntrypointService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntrypointService],
    }).compile();

    service = module.get<EntrypointService>(EntrypointService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
