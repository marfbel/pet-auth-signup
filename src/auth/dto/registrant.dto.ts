import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegistrantDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'userName can only contain letters, numbers and underscores' })
  username: string;
}
