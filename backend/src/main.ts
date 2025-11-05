import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getUploadsPath } from './utils/uploads-path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }); app.useGlobalPipes(new ValidationPipe());

  // Servir archivos estáticos desde la carpeta uploads (ruta normalizada)
  app.useStaticAssets(getUploadsPath(), {
    prefix: '/uploads/',
  });

// Servir archivos estáticos desde la carpeta frontend/src/assets/images/profile para avatares por defecto
  app.useStaticAssets(join(__dirname, '..', '..', 'frontend', 'src', 'assets', 'images', 'profile'), {
    prefix: '/assets/images/profile/',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
