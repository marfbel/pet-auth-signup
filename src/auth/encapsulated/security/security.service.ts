import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

import { RegistrantDto } from 'src/auth/dto/registrant.dto';
import { RegistrantHashDto } from 'src/auth/dto/registrant-hash.dto';
import { LoginAttemptsService } from './redis.service';
/**
 * Кастомное исключение для превышения количества попыток входа.
 * Используется в LoginAttemptsService.
 */
import { TooManyRequestsException } from './redis.service';


@Injectable()
export class SecurityService {
    constructor(
        private readonly loginAttemptsService: LoginAttemptsService,
    ) { }

    /**
      * Хеширует пароль с использованием bcrypt.
      * @param password - пароль в plain text
      * @returns хешированный пароль
      */
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    /**
     * Хеширует данные регистранта.
     * @param registrant - DTO с данными регистранта (email, username, password)
     * @returns DTO с хешированным паролем
     */
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

    /**
     * Генерирует компактный идентификатор сессии в формате base64url.
     * @param length - количество байт (по умолчанию 16)
     * @returns строка в base64url (22 символа для 16 байт)
     */
    generateCompactSessionId(length = 16): string {
        // 16 байт → 22 символа в base64url (без +, /, =)
        return randomBytes(length).toString('base64url');
    }

    /**
     * Увеличивает счётчик неудачных попыток входа.
     * @param userId - идентификатор пользователя
     * @returns true если лимит не превышен, false в противном случае
     */
    async incrementAttempts(userId: string): Promise<boolean> {
        return this.loginAttemptsService.incrementAttempts(userId);
    }

    /**
     * Сбрасывает счётчик неудачных попыток входа.
     * @param userId - идентификатор пользователя
     */
    async resetAttempts(userId: string): Promise<void> {
        return this.loginAttemptsService.resetAttempts(userId);
    }

    /**
     * Возвращает текущее количество неудачных попыток входа.
     * @param userId - идентификатор пользователя
     * @returns количество попыток или 0 если ключ не существует
     */
    async getAttempts(userId: string): Promise<number> {
        return this.loginAttemptsService.getAttempts(userId);
    }

    /**
     * Возвращает оставшееся время до сброса попыток в секундах.
     * @param userId - идентификатор пользователя
     * @returns TTL в секундах или -1 если ключ не существует
     */
    async getRemainingTtl(userId: string): Promise<number> {
        return this.loginAttemptsService.getRemainingTtl(userId);
    }

    /**
     * Возвращает количество оставшихся попыток входа.
     * @param userId - идентификатор пользователя
     * @returns количество оставшихся попыток (от 0 до MAX_ATTEMPTS)
     */
    async getRemainingAttempts(userId: string): Promise<number> {
        return this.loginAttemptsService.getRemainingAttempts(userId);
    }

}
