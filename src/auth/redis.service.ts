
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

export interface SessionData {
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
   * Удаляет сессию из Redis (при логауте).
   */
  async deleteSession(refreshToken: string): Promise<void> {
    await this.client.del(refreshToken);
  }
}
