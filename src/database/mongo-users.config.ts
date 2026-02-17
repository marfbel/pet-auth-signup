// src/database/mongo-users.config.ts
import { ConfigService } from '@nestjs/config';

export const mongoUsersConfig = (configService: ConfigService) => {
  const host = configService.get<string>('MONGO_USERS_HOST');
 const port = configService.get<string>('MONGO_USERS_PORT'); // 27018 из .env
  const db = configService.get<string>('MONGO_USERS_DB');
  const user = configService.get<string>('MONGO_USERS_USER');
  const pass = configService.get<string>('MONGO_USERS_PASS');

  // return {
  //   uri: `mongodb://${user}:${pass}@${host}:${port}/${db}`,
  // };

    return {
    uri: `mongodb://${user}:${pass}@${host}:${port}/${db}?authSource=admin`,

  };
};
