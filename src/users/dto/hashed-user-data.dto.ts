import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

// DTO for hashed user data
export class HashedUserData {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  passwordHash: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'username can only contain letters, numbers and underscores' })
  username: string;
}
