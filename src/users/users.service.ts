import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UserDataCheckDto } from './dto/user-data-check.dto';
import { HashedUserData } from './dto/hashed-user-data.dto';
import { UserObjectDto } from './dto/user-object.dto';

export type UserIdResult = { id: string } | false;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Проверяет, есть ли в базе пользователь с таким email или username.
   * Если есть совпадение — возвращает true.
   * Если нет — возвращает false.
   */
  async userDataCheck(dto: UserDataCheckDto): Promise<boolean> {
    try {
      const user = await this.userModel.findOne({
        $or: [{ email: dto.email }, { username: dto.username }],
      });
      const result: boolean = user !== null;
      return result;
    } catch (error: unknown) {
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Unknown error';
      }
      this.logger.error('Error in userDataCheck: ' + errorMessage);
      return false;
    }
  }

  /**
   * Проверяет, есть ли в базе пользователь с таким email.
   * Если есть — возвращает true.
   * Если нет — возвращает false.
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const user = await this.userModel.findOne({ email });
      const result: boolean = user !== null;
      return result;
    } catch (error: unknown) {
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Unknown error';
      }
      this.logger.error('Error in checkEmailExists: ' + errorMessage);
      return false;
    }
  }

  /**
   * Проверяет, есть ли в базе пользователь с таким username.
   * Если есть — возвращает true.
   * Если нет — возвращает false.
   */
  async checkUsernameExists(username: string): Promise<boolean> {
    try {
      const user = await this.userModel.findOne({ username });
      const result: boolean = user !== null;
      return result;
    } catch (error: unknown) {
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Unknown error';
      }
      this.logger.error('Error in checkUsernameExists: ' + errorMessage);
      return false;
    }
  }

  /**
   * Создаёт нового пользователя по DTO и сохраняет в базе через UserSchema.
   * Если успешно — возвращает объект с полем id в виде строки (_id.toString()).
   * Если ошибка — возвращает false.
   */
  async createUser(dto: HashedUserData): Promise<UserIdResult> {
    try {
      const newUser = new this.userModel({
        email: dto.email,
        username: dto.username,
        passwordHash: dto.passwordHash,
      });
      const savedUser = await newUser.save();
      const result: UserIdResult = { id: savedUser._id.toString() };
      return result;
    } catch (error: unknown) {
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Unknown error';
      }
      this.logger.error('Error in createUser: ' + errorMessage);
      return false;
    }
  }

  /**
   * Удаляет пользователя по _id.
   * Если успешно — возвращает объект с полем id.
   * Если ошибка — возвращает false.
   */
  async deleteUser(id: string): Promise<UserIdResult> {
    try {
      const result = await this.userModel.findByIdAndDelete(id);
      if (result) {
        const userIdResult: UserIdResult = { id: result._id.toString() };
        return userIdResult;
      }
      return false;
    } catch (error: unknown) {
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Unknown error';
      }
      this.logger.error('Error in deleteUser: ' + errorMessage);
      return false;
    }
  }

  /**
   * Ищет пользователя по email.
   * Если найден — возвращает объект { id, email, username, passwordHash, createdAt }.
   * Если не найден — возвращает false.
   */
  async findByEmail(email: string): Promise<UserObjectDto | false> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        return false;
      }
      const result: UserObjectDto = {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
      };
      return result;
    } catch (error: unknown) {
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Unknown error';
      }
      this.logger.error('Error in findByEmail: ' + errorMessage);
      return false;
    }
  }

  /**
   * Ищет пользователя по _id.
   * Возвращает объект или false.
   */
  async findById(id: string): Promise<UserObjectDto | false> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        return false;
      }
      const result: UserObjectDto = {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
      };
      return result;
    } catch (error: unknown) {
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Unknown error';
      }
      this.logger.error('Error in findById: ' + errorMessage);
      return false;
    }
  }

  /**
   * Ищет пользователя по username.
   * Возвращает объект или false.
   */
  async findByUsername(username: string): Promise<UserObjectDto | false> {
    try {
      const user = await this.userModel.findOne({ username });
      if (!user) {
        return false;
      }
      const result: UserObjectDto = {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
      };
      return result;
    } catch (error: unknown) {
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Unknown error';
      }
      this.logger.error('Error in findByUsername: ' + errorMessage);
      return false;
    }
  }
}
