import { Injectable } from '@nestjs/common';
import { CreateRegistrantDto } from './dto/create-registrant.dto';
import { AuthService } from '../auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtPayloadDto } from './dto/jwt-payload.dto';

@Injectable()
export class EntrypointService {
  constructor(
    private authService: AuthService,
    private usersServise: UsersService
  ) {}

  async userRegister(regApi:CreateRegistrantDto) {
   const hashRegApi = await this.authService.hashRegistrant(regApi)

    const userName = hashRegApi.username
    const email = hashRegApi.email

    const emailAnswer = await this.usersServise.checkEmailExists(email)
    if(emailAnswer) return false

    const userAnswer = await this.usersServise.checkUsernameExists(userName)
    if(userAnswer) return false

    const userId = await this.usersServise.createUser(hashRegApi)
    if(!userId) return false

    const sessionId = this.authService.generateCompactSessionId()

    const payload:JwtPayloadDto = {
      userId: userId.id,
      sessionId: sessionId
    }

    const refreshToken = this.authService.generateRefreshToken(payload)
    const accessToken = this.authService.generateAccessToken(payload)


    
  }
}
