import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';

import { EncapsulatedModule } from './encapsulated/encapsulated.module';
import { JwtGuard } from './guards/jwt.guard';


@Module({
  imports: [EncapsulatedModule],
  providers: [AuthService, JwtGuard],
  exports: [AuthService, JwtGuard],
})
export class AuthModule {}
