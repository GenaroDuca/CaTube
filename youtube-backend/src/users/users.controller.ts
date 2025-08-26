import { Body, Controller, Get, Post, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto'; // Importamos nuestro DTO
import { UsersService } from './users.service'; // Importamos nuestro Servicio

@Controller('users') // Todas las rutas aquí dentro empezarán con /users
export class UsersController {
    // Inyectamos el UsersService para poder usar sus métodos
    constructor(private readonly usersService: UsersService) { }

    // --- Endpoint para CREAR un usuario ---
    @Post() // Este método se activará con una petición HTTP POST a /users
    create(@Body() createUserDto: CreateUserDto) {
        // 1. El decorador @Body() extrae el JSON del cuerpo de la petición.
        // 2. NestJS lo valida automáticamente contra nuestro CreateUserDto.
        // 3. Si es válido, se lo pasamos a nuestro servicio.
        return this.usersService.create(createUserDto);
    }

    // --- Endpoint para OBTENER todos los usuarios ---
    @Get() // Este método se activará con una petición HTTP GET a /users
    findAll() {
        // Simplemente llamamos al método del servicio que busca todos los usuarios.
        return this.usersService.findAll();
    }

    @Delete(':id') // Se activará con una petición DELETE a /users/ALGUN_NUMERO
    remove(@Param('id', ParseIntPipe) id: number) {
    // 1. @Param('id') extrae el 'id' de la URL (ej: el '1' de /users/1).
    // 2. ParseIntPipe lo convierte automáticamente de texto a número y valida que sea un número.
    // 3. Llamamos al método del servicio para que haga el trabajo.
    return this.usersService.remove(id);
    }
}