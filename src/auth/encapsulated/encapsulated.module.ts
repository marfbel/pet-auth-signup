import { Module } from '@nestjs/common';
import { SecurityService } from './security/security.service';
import { TokenService } from './token/token.service';
import { LoginAttemptsService} from './security/redis.service';
import { RedisDBTokenService } from './token/redis.service';

@Module({
  providers: [
    SecurityService,
    LoginAttemptsService,
    TokenService,
    RedisDBTokenService
  ],
  exports: [
    SecurityService,
    TokenService,
  ],
})
export class EncapsulatedModule {}
