import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; // Importamos el inyector
import { Repository } from 'typeorm'; // Importamos la herramienta Repository
import { CreateUserDto } from './dto/create-user.dto'; // Importamos nuestro DTO
import { User } from './user.entity'; // Importamos nuestra Entidad

@Injectable()
export class UsersService {
    // El constructor es donde ocurre la "inyección de dependencias"
    constructor(
        @InjectRepository(User) // ¡Esta es la magia!
        private usersRepository: Repository<User>,
    ) { }

    // Método para crear un nuevo usuario
    create(createUserDto: CreateUserDto): Promise<User> {
        // 1. Creamos una instancia de la entidad User con los datos del DTO
        const newUser = this.usersRepository.create(createUserDto);

        // Más adelante, aquí es donde añadiremos un paso crucial:
        // encriptar la contraseña antes de guardarla.
        // Pero por ahora, para entender el flujo, la guardaremos directamente.

        // 2. Guardamos la nueva entidad en la base de datos
        return this.usersRepository.save(newUser);
    }

    // Método para obtener todos los usuarios (muy útil para probar)
    findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
    }
}