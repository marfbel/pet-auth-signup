import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegistrantDto } from './dto/registrant.dto';
import { RegistrantHashDto } from './dto/registrant-hash.dto';
import { randomBytes } from 'crypto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { SecurityService } from './encapsulated/security/security.service';
import { TokenService } from './encapsulated/token/token.service';




@Injectable()
export class AuthService {
  constructor(
    private readonly securityService: SecurityService,
    private readonly tokenService: TokenService,
  ) { }

  /**
   * Хеширует пароль с использованием bcrypt.
   * @param password - пароль в plain text
   * @returns хешированный пароль
   */
  async hashPassword(password: string): Promise<string> {
    return this.securityService.hashPassword(password)
  }

  async hashRegistrant(registrant: RegistrantDto): Promise<RegistrantHashDto> {
    return this.hashRegistrant(registrant)
  }

  /**
   * Проверяет соответствие пароля хэшу.
   * @param plainPassword - пароль в plain text (от пользователя)
   * @param hashedPassword - сохранённый хэш пароля из БД
   * @returns true если пароли совпадают, false в противном случае
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return this.securityService.verifyPassword(plainPassword, hashedPassword)
  }

  generateCompactSessionId(length = 16): string {
    return this.securityService.generateCompactSessionId(length)
  }



  generateAccessToken(payload: JwtPayloadDto): string {
    return this.tokenService.generateAccessToken(payload)
  }

  generateRefreshToken(payload: JwtPayloadDto): string {
    return this.tokenService.generateRefreshToken(payload)
  }


  /**
   * Сохраняет сессию в Redis.
   * Ключ = refreshToken (plain), значение = { userId, sessionId }, TTL = 7 дней.
   * @returns true - успех, false - ошибка
   */
  async saveRefreshToken(
    userId: string,
    sessionId: string,
    refreshToken: string,
  ): Promise<boolean> {
    return this.tokenService.saveRefreshToken(
      userId,
      sessionId,
      refreshToken
    )
  }


  /**
   * Верифицирует access токен.
   * Проверяет подпись по JWT_ACCESS_SECRET и время жизни токена.
   * @param accessToken - JWT токен для проверки
   * @returns payload токена если валидный, false в противном случае
   */
  verifyAccessToken(accessToken: string): JwtPayloadDto | false {
    return this.tokenService.verifyAccessToken(accessToken)
  }

  /**
   * Обновляет accessToken по refreshToken.
   * Проверяет сессию в Redis - если есть и TTL не истёк, генерирует новый accessToken.
   * Если сессия не найдена (или TTL истёк) - возвращает null.
   * @returns accessToken или null
   */
  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    return this.tokenService.refreshAccessToken(refreshToken)
  }

  async rotateTokens(refreshToken: string) {
    return this.tokenService.rotateTokens(refreshToken)
  }

  /**
   * Удаляет сессию из Redis при логауте.
   * @returns true - успех, false - ошибка
   */
  async logout(refreshToken: string): Promise<boolean> {
    return this.tokenService.logout(refreshToken)
  }

  /**
   * Получает userId по refreshToken из Redis.
   * @returns userId или null если сессия не найдена
   */
  async getUserIdByRefreshToken(refreshToken: string): Promise<string | null> {
    return this.tokenService.getUserIdByRefreshToken(refreshToken)
  }

  /**
   * Получает все сессии из Redis.
   * Используется для технического мониторинга/отладки.
   * @returns массив всех сессий
   */
  async getAllSessions(): Promise<{ refreshToken: string; userId: string; sessionId: string }[]> {
    return this.tokenService.getAllSessions();
  }

  /**
   * Удаляет все сессии пользователя из Redis по userId.
   * Используется для logout со всех устройств.
   * @returns количество удалённых сессий
   */
  async deleteAllUserSessions(userId: string): Promise<number> {
    return this.tokenService.deleteAllUserSessions(userId)
  }

}
