import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegistrantDto } from './dto/registrant.dto';
import { RegistrantHashDto } from './dto/registrant-hash.dto';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';


const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;


@Injectable()
export class AuthService {

  async hashRegistrant(registrant: RegistrantDto): Promise<RegistrantHashDto> {
    const passwordHash = await bcrypt.hash(registrant.password, 10);

    return {
      email: registrant.email,
      username: registrant.username,
      passwordHash,
    };
  }

  generateCompactSessionId(length = 16): string {
    // 16 байт → 22 символа в base64url (без +, /, =)
    return randomBytes(length).toString('base64url');
  }


  generateAccessToken(payload: object): string {
    const accessSecret = JWT_ACCESS_SECRET;
    if (!accessSecret) throw new Error('JWT_ACCESS_SECRET is not defined');

    return jwt.sign(payload, accessSecret, { expiresIn: '15m' });
  }

  generateRefreshToken(payload: object): string {
    const refreshSecret =  JWT_REFRESH_SECRET;
    if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET is not defined');

    return jwt.sign(payload, refreshSecret, { expiresIn: '7d' });
  }


  
}
