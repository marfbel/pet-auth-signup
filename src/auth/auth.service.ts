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

  /**
   * Хеширует данные регистранта, преобразуя пароль в хэш.
   * @param registrant - DTO с данными регистранта (email, username, password)
   * @returns DTO с хешированным паролем
   */
  async hashRegistrant(registrant: RegistrantDto): Promise<RegistrantHashDto> {
    return this.securityService.hashRegistrant(registrant)
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

  /**
   * Генерирует компактный идентификатор сессии в формате base64url.
   * @param length - количество байт (по умолчанию 16)
   * @returns строка в base64url (22 символа для 16 байт)
   */
  generateCompactSessionId(length = 16): string {
    return this.securityService.generateCompactSessionId(length)
  }


  /**
   * Увеличивает счётчик неудачных попыток входа.
   * @param userId - идентификатор пользователя
   * @returns true если лимит не превышен, false в противном случае
   */
  async incrementAttempts(userId: string): Promise<boolean> {
    return this.securityService.incrementAttempts(userId);
  }

  /**
   * Сбрасывает счётчик неудачных попыток входа.
   * @param userId - идентификатор пользователя
   */
  async resetAttempts(userId: string): Promise<void> {
    return this.securityService.resetAttempts(userId);
  }

  /**
   * Возвращает текущее количество неудачных попыток входа.
   * @param userId - идентификатор пользователя
   * @returns количество попыток или 0 если ключ не существует
   */
  async getAttempts(userId: string): Promise<number> {
    return this.securityService.getAttempts(userId);
  }

  /**
   * Возвращает оставшееся время до сброса попыток в секундах.
   * @param userId - идентификатор пользователя
   * @returns TTL в секундах или -1 если ключ не существует
   */
  async getRemainingTtl(userId: string): Promise<number> {
    return this.securityService.getRemainingTtl(userId);
  }


  /**
  * Возвращает количество оставшихся попыток входа.
  * @param userId - идентификатор пользователя
  * @returns количество оставшихся попыток (от 0 до MAX_ATTEMPTS)
  */
  async getRemainingAttempts(userId: string): Promise<number> {
    return this.securityService.getRemainingAttempts(userId);
  }

  /**
   * Генерирует JWT access token для аутентификации запросов.
   * @param payload - данные для токена (userId, sessionId)
   * @returns JWT строка access токена
   */
  generateAccessToken(payload: JwtPayloadDto): string {
    return this.tokenService.generateAccessToken(payload)
  }

  /**
   * Генерирует JWT refresh token для обновления access токена.
   * @param payload - данные для токена (userId, sessionId)
   * @returns JWT строка refresh токена
   */
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

  /**
   * Обновляет пару токенов (access и refresh) с ротацией сессии.
   * Используется для безопасного обновления токенов без повторной аутентификации.
   * @param refreshToken - текущий refresh токен
   * @returns объект с новыми access и refresh токенами
   */
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
