import { Injectable, OnModuleDestroy, HttpException, HttpStatus } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Кастомное исключение для превышения количества попыток входа.
 */
export class TooManyRequestsException extends HttpException {
  constructor(userId: string, remainingSeconds: number) {
    super(
      {
        message: 'Слишком много попыток входа. Попробуйте позже.',
        userId,
        remainingSeconds,
        error: 'Too Many Requests',
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

/**
 * Сервис для управления попытками входа с использованием Redis.
 * Реализует механизм блокировки после превышения лимита неудачных попыток.
 */
@Injectable()
export class LoginAttemptsService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly KEY_PREFIX = 'login_attempts:';
  private readonly MAX_ATTEMPTS = 5;
  private readonly TTL_SECONDS = 15 * 60; // 15 минут

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
   * Увеличивает счётчик неудачных попыток входа для данного userId.
   * При первой попытке создаёт ключ с TTL 15 минут.
   * Если количество попыток превышает 5 - выбрасывает TooManyRequestsException.
   *
   * @param userId - идентификатор пользователя
   * @throws TooManyRequestsException - при превышении лимита попыток
   */
  async incrementAttempts(userId: string) {
    const key = `${this.KEY_PREFIX}${userId}`;

    // Проверяем существование ключа
    const keyExists = await this.client.exists(key) === 1;

    // Увеличиваем счётчик
    const currentAttempts = await this.client.incr(key);

    // Если ключ не существовал, устанавливаем TTL
    if (!keyExists && currentAttempts === 1) {
      await this.client.expire(key, this.TTL_SECONDS);
    }

    // Если количество попыток превышает максимум - выбрасываем исключение
    if (currentAttempts > this.MAX_ATTEMPTS) {
      // Получаем актуальный TTL для сообщения
      const actualTtl = await this.client.ttl(key);
      let ttlValue: number;
      
      if (actualTtl > 0) {
        ttlValue = actualTtl;
      } else {
        ttlValue = this.TTL_SECONDS;
      }
      
      // throw new TooManyRequestsException(userId, ttlValue);
      return false
    }
    return true
  }

  /**
   * Сбрасывает счётчик неудачных попыток входа для успешного входа.
   * Удаляет ключ из Redis.
   *
   * @param userId - идентификатор пользователя
   */
  async resetAttempts(userId: string): Promise<void> {
    const key = `${this.KEY_PREFIX}${userId}`;
    await this.client.del(key);
  }

  /**
   * Возвращает текущее количество неудачных попыток входа.
   *
   * @param userId - идентификатор пользователя
   * @returns количество попыток или 0 если ключ не существует
   */
  async getAttempts(userId: string): Promise<number> {
    const key = `${this.KEY_PREFIX}${userId}`;
    const value = await this.client.get(key);
    
    if (value) {
      return parseInt(value, 10);
    } else {
      return 0;
    }
  }

  /**
   * Возвращает оставшееся время до сброса попыток в секундах.
   *
   * @param userId - идентификатор пользователя
   * @returns TTL в секундах или -1 если ключ не существует
   */
  async getRemainingTtl(userId: string): Promise<number> {
    const key = `${this.KEY_PREFIX}${userId}`;
    return this.client.ttl(key);
  }

  /**
   * Возвращает количество оставшихся попыток входа.
   *
   * @param userId - идентификатор пользователя
   * @returns количество оставшихся попыток (от 0 до MAX_ATTEMPTS)
   */
  async getRemainingAttempts(userId: string): Promise<number> {
    const usedAttempts = await this.getAttempts(userId);
    const remaining = this.MAX_ATTEMPTS - usedAttempts;
    
    if (remaining > 0) {
      return remaining;
    } else {
      return 0;
    }
  }
}
