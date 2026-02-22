import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import type { Response } from 'express';
import { EntrypointService } from './entrypoint.service';
import { CreateRegistrantDto } from './dto/create-registrant.dto';
import { UsersService } from '../users/users.service';
import { CreateLoginDto } from './dto/create-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangeUsernameDto } from './dto/change-username.dto';


@Controller('entrypoint')
export class EntrypointController {
  constructor(
    private readonly entrypointService: EntrypointService,
    private readonly usersService: UsersService,
  ) { }

  /**
   * POST /entrypoint/register
   * Регистрация нового пользователя
   */
  @Post('register')
  async register(
    @Body() createRegistrantDto: CreateRegistrantDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokenObj = await this.entrypointService.userRegister(createRegistrantDto);
    // if (!tokenObj) return false
    const { accessToken, refreshToken } = tokenObj

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/entrypoint/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }
  @Post('login')
  async login(
    @Body() createLoginDto: CreateLoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
   const tokenObj = await this.entrypointService.userLogin(createLoginDto)
    // if (!tokenObj) return false
    const { accessToken, refreshToken } = tokenObj

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/entrypoint/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  /**
   * POST /entrypoint/change-password
   * Смена пароля пользователя
   * @body { accessToken: string, newPassword: string }
   * @returns true - успех
   */
  @Post('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.entrypointService.changePassword(changePasswordDto);
  }

  /**
   * POST /entrypoint/change-email
   * Смена email пользователя
   * @body { accessToken: string, newEmail: string }
   * @returns true - успех
   */
  @Post('change-email')
  async changeEmail(@Body() changeEmailDto: ChangeEmailDto) {
    return this.entrypointService.changeEmail(changeEmailDto);
  }

  /**
   * POST /entrypoint/change-username
   * Смена username пользователя
   * @body { accessToken: string, newUsername: string }
   * @returns true - успех
   */
  @Post('change-username')
  async changeUsername(@Body() changeUsernameDto: ChangeUsernameDto) {
    return this.entrypointService.changeUsername(changeUsernameDto);
  }


  
  /**
   * POST /entrypoint/logout
   * Удаление сессии пользователя по refreshToken (logout с текущего устройства)
   * @body { refreshToken: string }
   * @returns true - успех, false - ошибка
   */
  @Post('logout')
  async logout(@Body() body: { refreshToken: string }) {
    return this.entrypointService.userLogout(body.refreshToken);
  }




  /**
   * POST /entrypoint/refresh
   * Обновление access token по refresh token
   * @body { refreshToken: string }
   * @returns { accessToken: string } - новый access token
   */
  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.entrypointService.refreshTokens(body.refreshToken);
  }










  /**
   * POST /entrypoint/logout-all
   * Удаление всех сессий пользователя по userId (logout со всех устройств)
   * Пользователь остаётся в MongoDB
   * @body { userId: string }
   * @returns количество удалённых сессий
   */
  @Post('logout-all')
  async logoutAll(@Body() body: { userId: string }) {
    return this.entrypointService.userLogoutAll(body.userId);
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

  /**
   * GET /entrypoint/alldata
   * Получает все данные из БД (MongoDB и Redis).
   * Используется для технического мониторинга/отладки в Postman.
   * @returns объект с массивом пользователей и массивом сессий
   */
  @Get('alldata')
  async getAllData() {
    return this.entrypointService.getAllData();
  }

}
