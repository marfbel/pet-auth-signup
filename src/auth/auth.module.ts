import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RedisDBTokenService } from './encapsulated/token/redis.service';
import { EncapsulatedModule } from './encapsulated/encapsulated.module';


@Module({
  imports: [EncapsulatedModule],
  providers: [AuthService, RedisDBTokenService],
  exports: [AuthService],
})
export class AuthModule {}
