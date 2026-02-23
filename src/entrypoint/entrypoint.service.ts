import { Injectable } from '@nestjs/common';
import { CreateRegistrantDto } from './dto/create-registrant.dto';
import { AuthService } from '../auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { CreateLoginDto } from './dto/create-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangeUsernameDto } from './dto/change-username.dto';

import { ConflictException } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';

export interface AllDataResult {
  users: { id: string; email: string; username: string; createdAt: Date }[];
  sessions: { refreshToken: string; userId: string; sessionId: string }[];
}

@Injectable()
export class EntrypointService {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) { }

  async userRegister(regApi: CreateRegistrantDto) {
    const hashRegApi = await this.authService.hashRegistrant(regApi)

    const userName = hashRegApi.username
    const email = hashRegApi.email

    const emailExists = await this.usersService.checkEmailExists(email);
    if (emailExists) {
      throw new ConflictException('Email is already in use');
    }

    const usernameExists = await this.usersService.checkUsernameExists(userName);
    if (usernameExists) {
      throw new ConflictException('Username is already in use');
    }

    const userId = await this.usersService.createUser(hashRegApi);
    if (!userId) {
      throw new InternalServerErrorException('Failed to create user due to database error');
    }

    const sessionId = this.authService.generateCompactSessionId()

    const payload: JwtPayloadDto = {
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
    if (!refreshTokenSaveResult) {
      await this.usersService.deleteUser(userId.id)
      throw new InternalServerErrorException('Failed to register user session');
    }

    return {
      refreshToken,
      accessToken
    }
  }

  async userLogin(logApi: CreateLoginDto) {
    const email = logApi.email
    const password = logApi.password

    const userDataByEmail = await this.usersService.findByEmail(email)
    if (!userDataByEmail) {
      throw new NotFoundException('Email not found');
    }

    const passwordHash = userDataByEmail.passwordHash

    const verifyResult = await this.authService.verifyPassword(password, passwordHash)
    if (!verifyResult) {
      throw new UnauthorizedException('Password is incorrect');
    }

    const userId = userDataByEmail.id

    const sessionId = this.authService.generateCompactSessionId()

    const payload: JwtPayloadDto = {
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
    if (!refreshTokenSaveResult) {
      throw new InternalServerErrorException('Failed to register user session');
    }


    return {
      refreshToken,
      accessToken
    }
  }


  async changePassword(changePasswordDto: ChangePasswordDto) {
    const { accessToken, oldPassword, newPassword } = changePasswordDto

    const payload = this.authService.verifyAccessToken(accessToken)
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
    const userId = payload.userId
    const userObj = await this.usersService.findById(userId)
    if (!userObj) {
      throw new NotFoundException('User not found');
    }
    const hashOldPassword = userObj.passwordHash
    const verifyResult = await this.authService.verifyPassword(oldPassword, hashOldPassword)
    if (!verifyResult) {
      throw new UnauthorizedException('Old password is incorrect');
    }
    
    const passwordHash = await this.authService.hashPassword(newPassword)
    const passwordChangeResult = await this.usersService.updatePassword(userId, passwordHash)
    if (!passwordChangeResult) {
      throw new InternalServerErrorException('Failed to update password');
    }
    return true
  }

  async changeEmail(changeEmailDto: ChangeEmailDto) {
    const { accessToken, newEmail } = changeEmailDto

    const payload = this.authService.verifyAccessToken(accessToken)
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
    const userId = payload.userId

    const emailExists = await this.usersService.checkEmailExists(newEmail);
    if (emailExists) {
      throw new ConflictException('Email is already in use');
    }

    const emailChangeResult = await this.usersService.updateEmail(userId, newEmail)
    if (!emailChangeResult) {
      throw new InternalServerErrorException('Failed to update email');
    }
    return true
  }

  async changeUsername(changeUsernameDto: ChangeUsernameDto) {
    const { accessToken, newUsername } = changeUsernameDto

    const payload = this.authService.verifyAccessToken(accessToken)
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
    const userId = payload.userId

    const usernameExists = await this.usersService.checkUsernameExists(newUsername);
    if (usernameExists) {
      throw new ConflictException('Username is already in use');
    }

    const usernameChangeResult = await this.usersService.updateUsername(userId, newUsername)
    if (!usernameChangeResult) {
      throw new InternalServerErrorException('Failed to update username');
    }
    return true
  }


  /**
   * Удаляет сессию пользователя из Redis по refreshToken (logout с текущего устройства).
   * @param refreshToken - refresh токен сессии
   * @returns true - успех, false - ошибка
   */
  async userLogout(refreshToken: string): Promise<boolean> {
    return this.authService.logout(refreshToken);

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
    const deleteResult = await this.usersService.deleteUser(userId);
    if (!deleteResult) {
      return false;
    }

    // 3. Удаляем сессию из Redis
    await this.authService.logout(refreshToken);

    return true;
  }

  /**
   * Получает все данные из БД (MongoDB и Redis).
   * Используется для технического мониторинга/отладки в Postman.
   * @returns объект с массивом пользователей и массивом сессий
   */
  async getAllData(): Promise<AllDataResult> {
    const users = await this.usersService.findAll();
    const sessions = await this.authService.getAllSessions();

    return {
      users,
      sessions,
    };
  }


  /**
   * Удаляет все сессии пользователя из Redis по userId (logout со всех устройств).
   * Пользователь остаётся в MongoDB.
   * @param userId - ID пользователя
   * @returns количество удалённых сессий
   */
  async userLogoutAll(userId: string): Promise<number> {
    return this.authService.deleteAllUserSessions(userId);
  }


  /**
   * Обновляет access token по refresh token.
   * Проверяет сессию в Redis и генерирует новый access token.
   * @param refreshToken - refresh токен из cookie
   * @returns объект с новым access token 
   */
  async refreshTokens(refreshToken: string): Promise<{ accessToken: string }> {
    const newAccessToken = await this.authService.refreshAccessToken(refreshToken);
    if (!newAccessToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return { accessToken: newAccessToken };
  }

  /**
   * Ротирует оба токена (access и refresh) по refresh token.
   * Удаляет старую сессию из Redis и создаёт новую с новыми токенами.
   * @param refreshToken - текущий refresh токен
   * @returns объект с новыми accessToken и refreshToken
   */
  async rotateTokens(refreshToken: string): Promise<{ newAccessToken: string; newRefreshToken: string }> {
    const result = await this.authService.rotateTokens(refreshToken);
    if (!result) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return result;
  }

}
