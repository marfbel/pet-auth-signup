import { Module } from '@nestjs/common';
import { EntrypointService } from './entrypoint.service';
import { EntrypointController } from './entrypoint.controller';

@Module({
  controllers: [EntrypointController],
  providers: [EntrypointService],
})
export class EntrypointModule {}
