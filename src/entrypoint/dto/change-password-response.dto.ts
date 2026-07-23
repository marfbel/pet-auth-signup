export class ChangePasswordResponseDto {
  success: boolean;           // true = пароль успешно изменён, false = нет
  attemptsLeft?: number;      // если есть ограничение по попыткам
  retryAfter?: number;        // оставшееся время блокировки в секундах
}