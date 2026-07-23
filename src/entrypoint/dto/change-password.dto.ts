import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;
  

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
