import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegistrantDto } from './dto/registrant.dto';
import { RegistrantHashDto } from './dto/registrant-hash.dto';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { RedisDBTokenService } from './redis.service';
import { JwtPayloadDto } from './dto/jwt-payload.dto';




@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: RedisDBTokenService
  ) { }
  /**
   * Хеширует пароль с использованием bcrypt.
   * @param password - пароль в plain text
   * @returns хешированный пароль
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async hashRegistrant(registrant: RegistrantDto): Promise<RegistrantHashDto> {
    const passwordHash = await this.hashPassword(registrant.password);

    return {
      email: registrant.email,
      username: registrant.username,
      passwordHash,
    };
  }



  /**
   * Проверяет соответствие пароля хэшу.
   * @param plainPassword - пароль в plain text (от пользователя)
   * @param hashedPassword - сохранённый хэш пароля из БД
   * @returns true если пароли совпадают, false в противном случае
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  generateCompactSessionId(length = 16): string {
    // 16 байт → 22 символа в base64url (без +, /, =)
    return randomBytes(length).toString('base64url');
  }

  generateAccessToken(payload: JwtPayloadDto): string {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessSecret) throw new Error('JWT_ACCESS_SECRET is not defined');

    return jwt.sign(payload, accessSecret, { expiresIn: '15m' });
  }

  generateRefreshToken(payload: JwtPayloadDto): string {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET is not defined');

    return jwt.sign(payload, refreshSecret, { expiresIn: '7d' });
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
    try {
      await this.tokenService.saveSession(refreshToken, userId, sessionId);
      return true;
    } catch {
      return false;
    }
  }


  /**
   * Верифицирует access токен.
   * Проверяет подпись по JWT_ACCESS_SECRET и время жизни токена.
   * @param accessToken - JWT токен для проверки
   * @returns payload токена если валидный, false в противном случае
   */
  verifyAccessToken(accessToken: string): JwtPayloadDto | false {
    try {
      const accessSecret = process.env.JWT_ACCESS_SECRET;
      if (!accessSecret) {
        console.error('JWT_ACCESS_SECRET is not defined');
        return false;
      }

      const payload = jwt.verify(accessToken, accessSecret) as JwtPayloadDto
      return payload;
    } catch {
      return false;
    }
  }

  /**
   * Обновляет accessToken по refreshToken.
   * Проверяет сессию в Redis - если есть и TTL не истёк, генерирует новый accessToken.
   * Если сессия не найдена (или TTL истёк) - возвращает null.
   * @returns accessToken или null
   */
  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      const session = await this.tokenService.getSession(refreshToken);

      if (!session) {
        return null;
      }

      const payload: JwtPayloadDto = {
        userId: session.userId,
        sessionId: session.sessionId,
      };

      return this.generateAccessToken(payload);
    } catch {
      return null;
    }
  }

  /**
   * Удаляет сессию из Redis при логауте.
   * @returns true - успех, false - ошибка
   */
  async logout(refreshToken: string): Promise<boolean> {
    try {
      await this.tokenService.deleteSession(refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Получает userId по refreshToken из Redis.
   * @returns userId или null если сессия не найдена
   */
  async getUserIdByRefreshToken(refreshToken: string): Promise<string | null> {
    try {
      const session = await this.tokenService.getSession(refreshToken);
      return session?.userId ?? null;
    } catch {
      return null;
    }
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
    return this.tokenService.deleteSessionsByUserId(userId);
  }


}
