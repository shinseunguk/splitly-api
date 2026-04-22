import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('strict routing', true);
  app.setGlobalPrefix('api/v1/admin');

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const configService = app.get(ConfigService);
  const corsOrigins = configService.get<AppConfig['corsOrigins']>('corsOrigins') ?? [];
  const appPort = configService.get<AppConfig['appPort']>('appPort') ?? 3000;

  app.enableCors({
    origin: corsOrigins.includes('*') ? true : corsOrigins,
    credentials: false,
  });

  await app.listen(appPort);
}

void bootstrap();
