import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

export interface SessionData {
  userId: string;
  sessionId: string;
}

export interface AllSessionsResult {
  refreshToken: string;
  userId: string;
  sessionId: string;
}

@Injectable()
export class RedisDBTokenService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly TTL_SECONDS = 60 * 60 * 24 * 7; // 7 дней

  constructor() {
    this.client = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  /**
   * Сохраняет сессию в Redis.
   * Ключ = refreshToken (plain), значение = { userId, sessionId }, TTL = 7 дней.
   */
  async saveSession(
    refreshToken: string,
    userId: string,
    sessionId: string,
  ): Promise<void> {
    const value: SessionData = { userId, sessionId };
    await this.client.setex(refreshToken, this.TTL_SECONDS, JSON.stringify(value));
  }

  /**
   * Получает сессию из Redis.
   * Если TTL истёк - Redis автоматически удаляет ключ (ленивое удаление).
   * Возвращает null если ключ не найден или истёк.
   */
  async getSession(refreshToken: string): Promise<SessionData | null> {
    const data = await this.client.get(refreshToken);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as SessionData;
  }

  /**
   * Удаляет сессию из Redis .
   */
  async deleteSession(refreshToken: string): Promise<void> {
    await this.client.del(refreshToken);
  }

  /**
   * Возвращает все сессии из Redis.
   * Используется для технического мониторинга/отладки.
   * Внимание: KEYS * не рекомендуется использовать в production с большим количеством ключей.
   */
  async getAllSessions(): Promise<AllSessionsResult[]> {
    try {
      const keys = await this.client.keys('*');
      const results: AllSessionsResult[] = [];

      for (const key of keys) {
        const data = await this.client.get(key);
        if (data) {
          const sessionData = JSON.parse(data) as SessionData;
          results.push({
            refreshToken: key,
            userId: sessionData.userId,
            sessionId: sessionData.sessionId,
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error getting all sessions:', error);
      return [];
    }
  }

  /**
   * Удаляет все сессии пользователя из Redis по userId.
   * Используется для logout со всех устройств.
   * @returns количество удалённых сессий
   */
  async deleteSessionsByUserId(userId: string): Promise<number> {
    try {
      const keys = await this.client.keys('*');
      let deletedCount = 0;

      for (const key of keys) {
        const data = await this.client.get(key);
        if (data) {
          const sessionData = JSON.parse(data) as SessionData;
          if (sessionData.userId === userId) {
            await this.client.del(key);
            deletedCount++;
          }
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Error deleting sessions by userId:', error);
      return 0;
    }
  }
}
