import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';

import { EncapsulatedModule } from './encapsulated/encapsulated.module';


@Module({
  imports: [EncapsulatedModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
