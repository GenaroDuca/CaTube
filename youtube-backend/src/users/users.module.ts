import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importamos la herramienta de TypeORM
import { User } from './user.entity'; // Importamos nuestra entidad que acabamos de crear
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Importamos la entidad User
  ],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule { }
