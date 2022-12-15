import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };
  app.enableCors(options);
  const server = await app.listen(3000);
  server.setTimeout(1800000); // 600,000=> 10Min, 1200,000=>20Min, 1800,000=>30Min
}
bootstrap();
