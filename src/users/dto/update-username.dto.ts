import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class UpdateUsernameDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'username can only contain letters, numbers and underscores' })
  username: string;
}
