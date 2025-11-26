import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getUploadsPath } from './utils/uploads-path';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Aumentar el límite de tamaño del cuerpo de la solicitud
  app.use(json({ limit: '500mb' }));
  app.use(urlencoded({ extended: true, limit: '500mb' }));

  app.enableCors({
    origin: [
      'https://catube-steel.vercel.app',
      'https://catube.xyz',
      'https://www.catube.xyz',
      "http://localhost:5173"
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  // Servir archivos estáticos desde la carpeta uploads
  app.useStaticAssets(getUploadsPath(), {
    prefix: '/uploads/',
  });

  // Servir avatares por defecto desde frontend/src/assets/images/profile
  app.useStaticAssets(
    join(__dirname, '..', '..', 'frontend', 'src', 'assets'),
    {
      // El prefijo es '/assets/'. Esto mapea la carpeta 'assets' a esta URL.
      prefix: '/assets/',
    }
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();