import { Injectable, Inject, forwardRef, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm'; // Importamos QueryFailedError
import { CreateUserDto } from './dto-users/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ChannelsService } from 'src/channels/channels.service';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,

        @Inject(forwardRef(() => ChannelsService))
        private channelsService: ChannelsService,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const capitalizedUsername = createUserDto.username.charAt(0).toUpperCase() + createUserDto.username.slice(1);

        // =================================================================
        // 1. VALIDACIÓN DE UNICIDAD DEL USERNAME (Previa a la inserción)
        // =================================================================
        const existingUserByUsername = await this.usersRepository.findOne({
            where: { username: capitalizedUsername },
        });
        if (existingUserByUsername) {
            throw new ConflictException('Username already exists'); 
        }

        // =================================================================
        // 2. VALIDACIÓN DE UNICIDAD DEL EMAIL (¡CORRECCIÓN CLAVE!)
        // =================================================================
        const existingUserByEmail = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUserByEmail) {
            // Lanzp el mensaje exacto que el frontend espera
            throw new ConflictException('Email already exists'); 
        }

        // 3. HASHEO Y CREACIÓN DEL OBJETO
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        const newUser = this.usersRepository.create({
            username: capitalizedUsername,
            email: createUserDto.email,
            password: hashedPassword,
        });
        
        // =================================================================
        // 4. INSERCIÓN EN BD Y MANEJO DE ERRORES (¡CAPA DE SEGURIDAD!)
        // =================================================================
        try {
            const savedUser = await this.usersRepository.save(newUser);

            // Crea el canal si la inserción fue exitosa
            const defaultChannelDto = {
                channel_name: savedUser.username,
                description: `Bienvenido al canal de ${savedUser.username}`,
                url: savedUser.username.toLowerCase(),
            };

            await this.channelsService.create(defaultChannelDto, savedUser);

            return savedUser;
        } catch (error) {
            // Capturamos el error de la base de datos (QueryFailedError)
            // Esto maneja errores de restricción única en caso de race conditions.
            const uniqueViolationCode = '23505'; // Código común de PostgreSQL
      
            if (error instanceof QueryFailedError && (error as any).code === uniqueViolationCode) {
                const detail = (error as any).detail || error.message;

                // Relanza la excepción con el mensaje que React puede interpretar
                if (detail.includes('username')) {
                    throw new ConflictException('Username already exists'); 
                }
                if (detail.includes('email')) {
                    throw new ConflictException('Email already exists');
                }
            }
            
            // Si es un error diferente, lo relanzamos.
            throw error;
        }
    }

    findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async findOneByUsername(username: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { username },
            relations: ['channel'],
        });
    }

    findOneById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { user_id: id },
            relations: ['channel'], 
        });
    }

    async remove(id: string): Promise<void> {
        try {
            const user = await this.usersRepository.findOne({
                where: { user_id: id },
                relations: ['channel'],
            });

            if (!user) {
                throw new Error('User not found');
            }

            if (user.channel) {
                await this.channelsService.remove(user.channel.channel_id);
            }

            await this.usersRepository.delete(id);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}