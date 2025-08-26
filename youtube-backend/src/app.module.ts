import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importamos el TypeORM
import { UsersModule } from './users/users.module'; // Importamos el UsersModule
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/user.entity'; // Importamos la entidad User

@Module({
  imports: [
    // 1. Configuración principal de la base de datos.
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',       
      password: 'Colo123',   
      database: 'youtube_db',
      entities: [User],       // Le decimos explícitamente qué entidades usar
      synchronize: true,      // Solo para desarrollo
    }),

    // 2. Importar el módulo que necesita la conexión.
    // Al importar UsersModule aquí, le damos acceso a la conexión que creamos arriba.
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}