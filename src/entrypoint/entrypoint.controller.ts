import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EntrypointService } from './entrypoint.service';


@Controller('entrypoint')
export class EntrypointController {
  constructor(private readonly entrypointService: EntrypointService) {}


}
