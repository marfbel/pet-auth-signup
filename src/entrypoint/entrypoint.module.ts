import { Module } from '@nestjs/common';
import { EntrypointService } from './entrypoint.service';
import { EntrypointController } from './entrypoint.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [EntrypointController],
  providers: [EntrypointService],
})
export class EntrypointModule {}
