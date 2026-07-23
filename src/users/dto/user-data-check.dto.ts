import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// DTO for checking if user with email or username already exists
export class UserDataCheckDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;
}
