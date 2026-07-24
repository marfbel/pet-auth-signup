import { Module } from '@nestjs/common';
import { SecurityService } from './security/security.service';
import { TokenService } from './token/token.service';
import { LoginAttemptsService} from './security/redis.service';
import { RedisDBTokenService } from './token/redis.service';
import { RedisModule } from '../../database/redis.module';

@Module({
  imports: [RedisModule],
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
