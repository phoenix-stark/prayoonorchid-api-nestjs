import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.ENVIRONMENT || 'development',
  debug: process.env.APP_DEBUG === 'true',
  port: process.env.APP_PORT || 3000,
}));
