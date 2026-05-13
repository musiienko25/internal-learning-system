import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function parseCorsOrigins(): string | boolean | string[] {
  const raw = process.env.FRONTEND_ORIGIN;
  if (!raw || raw === '*') {
    return true;
  }
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length === 1 ? parts[0] : parts;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: parseCorsOrigins(),
    credentials: true,
  });
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
