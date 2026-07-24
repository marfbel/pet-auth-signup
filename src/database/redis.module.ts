import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisModule as NestRedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    NestRedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        config: {
          host: configService.get<string>('redis.host', 'localhost'),
          port: configService.get<number>('redis.port', 6379),
        },
      }),
    }),
  ],
  exports: [NestRedisModule],
})
export class RedisModule {}
