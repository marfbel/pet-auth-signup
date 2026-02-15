import { Injectable } from '@nestjs/common';
import { CreateEntrypointDto } from './dto/create-entrypoint.dto';
import { UpdateEntrypointDto } from './dto/update-entrypoint.dto';

@Injectable()
export class EntrypointService {
  create(createEntrypointDto: CreateEntrypointDto) {
    return 'This action adds a new entrypoint';
  }

  findAll() {
    return `This action returns all entrypoint`;
  }

  findOne(id: number) {
    return `This action returns a #${id} entrypoint`;
  }

  update(id: number, updateEntrypointDto: UpdateEntrypointDto) {
    return `This action updates a #${id} entrypoint`;
  }

  remove(id: number) {
    return `This action removes a #${id} entrypoint`;
  }
}
