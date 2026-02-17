import { Injectable } from '@nestjs/common';
import { CreateRegistrantDto } from './dto/create-registrant.dto';
import { AuthService } from '../auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { CreateLoginDto } from './dto/create-login.dto';

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

    const refreshTokenSaveResult = await this.authService.saveRefreshToken(
      userId.id,
      sessionId,
      refreshToken
    )
    if(!refreshTokenSaveResult) {
      await this.usersServise.deleteUser(userId.id)
      console.log('откат запись токена ошибка redis')
      return false
    }


    return{
      refreshToken,
      accessToken
    }
  }

  async userLogin(logApi:CreateLoginDto){
    const email = logApi.email
    const password = logApi.password

    const userDataByEmail = await this.usersServise.findByEmail(email)
    if(!userDataByEmail) return false

    const passwordHash = userDataByEmail.passwordHash

    const verifyResult = await this.authService.verifyPassword(password, passwordHash)
    if(!verifyResult) return verifyResult

    const userId = userDataByEmail.id

    const sessionId = this.authService.generateCompactSessionId()

      const payload:JwtPayloadDto = {
      userId: userId,
      sessionId: sessionId
    }

    const refreshToken = this.authService.generateRefreshToken(payload)
    const accessToken = this.authService.generateAccessToken(payload)

      const refreshTokenSaveResult = await this.authService.saveRefreshToken(
      userId,
      sessionId,
      refreshToken
    )
    if(!refreshTokenSaveResult) {
      await this.usersServise.deleteUser(userId)
      console.log('откат запись токена ошибка redis')
      return false
    }


    return{
      refreshToken,
      accessToken
    }
  }



  /**
   * Удаляет пользователя по refreshToken.
   * 1. Получает userId из Redis по refreshToken
   * 2. Удаляет пользователя из базы по userId
   * 3. Удаляет сессию из Redis
   * @returns true - успех, false - ошибка
   */
  async userDelete(refreshToken: string): Promise<boolean> {
    // 1. Получаем userId по refreshToken
    const userId = await this.authService.getUserIdByRefreshToken(refreshToken);
    if (!userId) {
      return false;
    }

    // 2. Удаляем пользователя по userId
    const deleteResult = await this.usersServise.deleteUser(userId);
    if (!deleteResult) {
      return false;
    }

    // 3. Удаляем сессию из Redis
    await this.authService.logout(refreshToken);

    return true;
  }


}
