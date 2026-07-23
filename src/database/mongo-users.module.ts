import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { mongoUsersConfig } from './mongo-users.config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: mongoUsersConfig,
    }),
  ],
  exports: [MongooseModule],
})
export class MongoUsersModule {}
