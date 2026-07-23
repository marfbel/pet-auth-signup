import { Module } from '@nestjs/common';
import { MongoUsersModule } from './mongo-users.module';
import { RedisModule } from './redis.module';

@Module({
  imports: [
    MongoUsersModule, // MongoDB
    RedisModule,      // Redis
  ],
  exports: [
    MongoUsersModule,
    RedisModule,
  ],
})
export class DatabaseModule {}