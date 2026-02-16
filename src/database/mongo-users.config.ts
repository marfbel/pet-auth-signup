// src/database/mongo-users.config.ts
import { ConfigService } from '@nestjs/config';

export const mongoUsersConfig = (configService: ConfigService) => {
  const host = configService.get<string>('MONGO_HOST');
  const port = configService.get<string>('MONGO_PORT');
  const db = configService.get<string>('MONGO_DB');
  const user = configService.get<string>('MONGO_USER');
  const pass = configService.get<string>('MONGO_PASS');

  return {
    uri: `mongodb://${user}:${pass}@${host}:${port}/${db}`,
  };
};
