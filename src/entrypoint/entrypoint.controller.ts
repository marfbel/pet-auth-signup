import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EntrypointService } from './entrypoint.service';
import { CreateEntrypointDto } from './dto/create-entrypoint.dto';
import { UpdateEntrypointDto } from './dto/update-entrypoint.dto';

@Controller('entrypoint')
export class EntrypointController {
  constructor(private readonly entrypointService: EntrypointService) {}

  @Post()
  create(@Body() createEntrypointDto: CreateEntrypointDto) {
    return this.entrypointService.create(createEntrypointDto);
  }

  @Get()
  findAll() {
    return this.entrypointService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entrypointService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEntrypointDto: UpdateEntrypointDto) {
    return this.entrypointService.update(+id, updateEntrypointDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.entrypointService.remove(+id);
  }
}
