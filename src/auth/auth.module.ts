import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RedisDBTokenService } from './redis.service';


@Module({
  providers: [AuthService, RedisDBTokenService],
  exports: [AuthService],
})
export class AuthModule {}
