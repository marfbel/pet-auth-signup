import { Injectable } from '@nestjs/common';
import { RedisDBTokenService } from './redis.service';
import jwt from 'jsonwebtoken';


import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';


@Injectable()
export class TokenService {
    constructor(
        private readonly redisDBTokenService: RedisDBTokenService,
    ) { }

    
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
          await this.redisDBTokenService.saveSession(refreshToken, userId, sessionId);
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
          const session = await this.redisDBTokenService.getSession(refreshToken);
    
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
    
      async rotateTokens(refreshToken: string) {
        const session = await this.redisDBTokenService.getSession(refreshToken)
        if (!session) {
          return false;
        }
    
        const payload: JwtPayloadDto = {
          userId: session.userId,
          sessionId: session.sessionId,
        };
    
        try {
          await this.redisDBTokenService.deleteSession(refreshToken)
        } catch (error) {
          return false
        }
    
        let newRefreshToken: string;
        let newAccessToken: string;
    
        try {
          newRefreshToken = this.generateRefreshToken(payload);
          newAccessToken = this.generateAccessToken(payload);
        } catch (error) {
          console.error(error);
          return false;
        }
    
        await this.redisDBTokenService.saveSession(
          newRefreshToken,
          payload.userId,
          payload.sessionId
        );
    
        return{
          newAccessToken,
          newRefreshToken
        }
      }
    
      /**
       * Удаляет сессию из Redis при логауте.
       * @returns true - успех, false - ошибка
       */
      async logout(refreshToken: string): Promise<boolean> {
        try {
          await this.redisDBTokenService.deleteSession(refreshToken);
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
          const session = await this.redisDBTokenService.getSession(refreshToken);
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
        return this.redisDBTokenService.getAllSessions();
      }
    
      /**
       * Удаляет все сессии пользователя из Redis по userId.
       * Используется для logout со всех устройств.
       * @returns количество удалённых сессий
       */
      async deleteAllUserSessions(userId: string): Promise<number> {
        return this.redisDBTokenService.deleteSessionsByUserId(userId);
      }
    

}
