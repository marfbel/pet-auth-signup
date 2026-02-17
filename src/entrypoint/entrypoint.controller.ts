import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EntrypointService } from './entrypoint.service';
import { CreateRegistrantDto } from './dto/create-registrant.dto';
import { UsersService } from '../users/users.service';
import { CreateLoginDto } from './dto/create-login.dto';


@Controller('entrypoint')
export class EntrypointController {
  constructor(
    private readonly entrypointService: EntrypointService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * POST /entrypoint/register
   * Регистрация нового пользователя
   */
  @Post('register')
  async register(@Body() createRegistrantDto: CreateRegistrantDto) {
    return this.entrypointService.userRegister(createRegistrantDto);
  }

  @Post('login')
  async login(@Body() createLoginDto:CreateLoginDto){
    return this.entrypointService.userLogin(createLoginDto)
  }


  /**
   * POST /entrypoint/delete
   * Удаление пользователя по refreshToken в теле запроса
   * @body { refreshToken: string }
   * @returns true - успех, false - ошибка
   */
  @Post('delete')
  async deleteData(@Body() body: { refreshToken: string }) {
    return this.entrypointService.userDelete(body.refreshToken);
  }
  



  /**
   * DELETE /entrypoint/:id
   * Удаление пользователя по id
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  /**
   * GET /entrypoint/user/:username
   * Поиск пользователя по имени пользователя
   */
  @Get('user/:username')
  async findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }
  
}
