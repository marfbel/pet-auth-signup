import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class ChangeEmailDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsEmail()
  @IsNotEmpty()
  newEmail: string;
}
