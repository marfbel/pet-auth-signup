import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
