import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class RegistrantHashDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  passwordHash: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'userName can only contain letters, numbers and underscores' })
  username: string;
}
