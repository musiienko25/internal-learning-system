import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

function parseCorsOrigins(): string | boolean | string[] {
  const raw = process.env.FRONTEND_ORIGIN;
  if (!raw || raw === '*') {
    return true;
  }
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length === 1 ? parts[0] : parts;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
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
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key'],
  });
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
void bootstrap();
