import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

import { RegistrantDto } from 'src/auth/dto/registrant.dto';
import { RegistrantHashDto } from 'src/auth/dto/registrant-hash.dto';


@Injectable()
export class SecurityService {
    constructor(
        // private readonly redisDBTokenService: RedisDBTokenService,
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

}
