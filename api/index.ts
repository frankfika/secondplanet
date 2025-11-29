import { NestFactory } from '@nestjs/core';
import { AppModule } from '../apps/server/src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const expressApp = express();
let app: ReturnType<typeof NestFactory.create> | null = null;

async function bootstrap() {
  if (!app) {
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { logger: ['error', 'warn'] }
    );

    nestApp.enableCors({
      origin: true,
      credentials: true,
    });

    nestApp.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    nestApp.setGlobalPrefix('api');
    await nestApp.init();
    app = nestApp as any;
  }
  return expressApp;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const server = await bootstrap();
  server(req as any, res as any);
};
