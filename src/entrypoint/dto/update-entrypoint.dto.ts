import { PartialType } from '@nestjs/mapped-types';
import { CreateEntrypointDto } from './create-entrypoint.dto';

export class UpdateEntrypointDto extends PartialType(CreateEntrypointDto) {}
