import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('strict routing', true);
  app.setGlobalPrefix('api/v1/admin');

  const configService = app.get(ConfigService);
  const appPort = configService.get<AppConfig['appPort']>('appPort') ?? 3000;

  await app.listen(appPort);
}

void bootstrap();
