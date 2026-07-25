import { IsNotEmpty, IsEmail } from 'class-validator';

export class ChangeEmailDto {
  @IsEmail()
  @IsNotEmpty()
  newEmail: string;
}
