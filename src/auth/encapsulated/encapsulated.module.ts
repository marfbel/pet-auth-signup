import { Module } from '@nestjs/common';
import { SecurityService } from './security/security.service';
import { TokenService } from './token/token.service';
import { RedisService } from '@liaoliaots/nestjs-redis';

@Module({
  providers: [SecurityService, TokenService, RedisService],
  exports: [SecurityService, TokenService],
})
export class EncapsulatedModule {}
