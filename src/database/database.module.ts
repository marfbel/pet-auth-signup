import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { mongoUsersConfig } from './mongo-users.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // подключаем .env глобально
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: mongoUsersConfig,
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}