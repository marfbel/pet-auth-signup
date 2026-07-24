export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongo: {
    host: process.env.MONGO_USERS_HOST || 'localhost',
    port: parseInt(process.env.MONGO_USERS_PORT ?? '27018', 10),
    db: process.env.MONGO_USERS_DB || 'promo-users',
    user: process.env.MONGO_USERS_USER || 'admin',
    pass: process.env.MONGO_USERS_PASS || 'user',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
  },
});