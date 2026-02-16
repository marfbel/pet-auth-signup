import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PromocodesModule } from './promocodes/promocodes.module';

import { EntrypointModule } from './entrypoint/entrypoint.module';
import { DatabaseModule } from './database/database.module';


@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    PromocodesModule,
    EntrypointModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
