// Успешный логин
export class LoginSuccessResponseDto {
  success: true;
  accessToken: string;
  refreshToken: string;
}

// Неудачная попытка
export class LoginFailedResponseDto {
  success: false;
  attemptsLeft: number;
  retryAfter: number;
}