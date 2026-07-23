import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { Expose } from 'class-transformer';

export class JwtPayloadDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  readonly userId: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  readonly sessionId: string;
}
