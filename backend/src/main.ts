import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors(); // Permitir peticiones desde otros dominios (liveserver)
  app.useGlobalPipes(new ValidationPipe());

  // Servir archivos estáticos desde la carpeta uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Servir archivos estáticos desde la carpeta frontend/src/assets/media/profile para avatares por defecto
  app.useStaticAssets(join(__dirname, '..', '..', 'frontend', 'src', 'assets', 'media', 'profile'), {
    prefix: '/assets/media/profile/',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
