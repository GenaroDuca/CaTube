import { Injectable, Inject, forwardRef, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, Like } from 'typeorm';
import { CreateUserDto } from './dto-users/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from "crypto";
import { ChannelsService } from 'src/channels/channels.service';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { UpdateUserDto } from './dto-users/update-user.dto';
import { DataSource } from 'typeorm';
import { Room } from 'src/rooms/entities/room.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,

        @Inject(forwardRef(() => ChannelsService))
        private channelsService: ChannelsService,

        private readonly configService: ConfigService,
        private readonly dataSource: DataSource,



    ) {
        this.findAll();
    }

    // =================================================================
    // MODO LECTURA: Método de creación de usuario
    // =================================================================

    async create(createUserDto: CreateUserDto): Promise<User> {
        const capitalizedUsername = createUserDto.username.charAt(0).toUpperCase() + createUserDto.username.slice(1);

        // 1 & 2. VALIDACIÓN DE UNICIDAD (Username y Email)
        const existingUserByUsername = await this.usersRepository.findOne({ where: { username: capitalizedUsername } });
        if (existingUserByUsername) {
            throw new ConflictException('Username already exists');
        }

        const existingUserByEmail = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
        if (existingUserByEmail) {
            throw new ConflictException('Email already exists');
        }

        // 3. HASHEO Y GENERACIÓN DE TOKEN
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 24 * 3600 * 1000); // Caducidad: 24 horas

        const newUser = this.usersRepository.create({
            username: capitalizedUsername,
            email: createUserDto.email,
            password: hashedPassword,
            // ASIGNACIÓN DE CAMPOS DE VERIFICACIÓN
            is_verified: false,
            verification_token: token,
            token_expiry: expiry,
        });

        // 4. INSERCIÓN EN BD Y MANEJO DE ERRORES
        try {
            const savedUser = await this.usersRepository.save(newUser); // Guarda el usuario con token

            // 5. PREPARACIÓN Y ENVÍO DEL EMAIL
            // Usamos la URL base de verificación configurada + el token
            const BASE_VERIFY_URL = this.configService.get<string>('BACKEND_VERIFY_URL');
            // Construye la URL completa que el usuario clickeará
            const verificationUrl = `${BASE_VERIFY_URL}?token=${token}`;

            await this.sendVerificationEmail(savedUser.email, verificationUrl);

            // 6. CREACIÓN DEL CANAL
            const defaultChannelDto = {
                channel_name: savedUser.username,
                description: `Bienvenido al canal de ${savedUser.username}`,
                url: savedUser.username.toLowerCase(),
            };
            await this.channelsService.create(defaultChannelDto, savedUser);

            return savedUser;
        } catch (error) {
            // Manejo de errores de TypeORM/DB
            const uniqueViolationCode = '23505';
            if (error instanceof QueryFailedError && (error as any).code === uniqueViolationCode) {
                const detail = (error as any).detail || error.message;
                if (detail.includes('username')) {
                    throw new ConflictException('Username already exists');
                }
                if (detail.includes('email')) {
                    throw new ConflictException('Email already exists');
                }
            }

            // Manejo de error de email
            if (error instanceof Error && error.message.includes('transporter')) {
                console.error('Error al enviar el correo:', error);
                // Opcional: Podrías eliminar el usuario si el correo es crítico, o dejarlo y marcar que el envío falló.
            }
            throw error;
        }
    }

    // =================================================================
    // Lógica de Verificación del Token
    // =================================================================

    /**
     * Valida el token recibido y verifica la cuenta del usuario.
     * @param token El token único de la URL.
     * @returns El usuario verificado.
     */
    async verifyEmail(token: string): Promise<User> {
        // 1. Buscar el usuario por el token
        const user = await this.usersRepository.findOne({
            where: { verification_token: token }
        });

        if (!user) {
            throw new NotFoundException('Token de verificación inválido o ya utilizado.');
        }

        // 2. Comprobar si ya está verificado
        if (user.is_verified) {
            // Ya está verificado, no hace falta reprocesar.
            return user;
        }

        // 3. Comprobar la caducidad
        if (user.token_expiry && user.token_expiry < new Date()) {
            throw new ConflictException('El token de verificación ha caducado. Por favor, solicite un nuevo enlace.');
        }

        // 4. Verificación exitosa: Actualizar el usuario
        user.is_verified = true;
        user.verification_token = null; // Limpia el token
        user.token_expiry = null;       // Limpia la caducidad

        return this.usersRepository.save(user);
    }

    // =================================================================
    // MODO LECTURA: Métodos Existentes
    // =================================================================

    findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async findOneByUsername(username: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { username },
            relations: ['channel'],
        });
    }

    /**
   * Busca usuarios por nombre de usuario que contenga la cadena de búsqueda.
   * @param query - El término de búsqueda.
   * @returns Promesa que resuelve a una lista de entidades User.
   */
    async searchUsers(query: string): Promise<Partial<User>[]> {
        const users = await this.usersRepository.find({
            // Usamos el operador 'Like' para buscar coincidencias parciales (case-insensitive en algunos BD)
            where: {
                username: Like(`%${query}%`),
            },
            // Excluye el campo 'password' para no enviarlo al frontend
            select: ['user_id', 'username', 'email'],
        });

        // Filtramos información sensible si el 'select' de TypeORM no es suficiente
        return users.map(user => ({
            user_id: user.user_id,
            username: user.username,
        }));
    }

    findOneById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { user_id: id },
            relations: ['channel'],
        });
    }

    /**
     * Obtiene los detalles del usuario autenticado por su ID.
     * @param userId El ID del usuario autenticado (extraído del JWT payload).
     * @returns Datos del usuario.
     */
    async findMe(userId: string): Promise<Partial<User>> {
        const user = await this.usersRepository.findOne({
            where: { user_id: userId },
            select: [
                'user_id',
                'username',
                'email',
                'avatarUrl',
                'description',
                'is_verified'
            ],
            relations: ['channel'],
        });

        if (!user) {
            throw new NotFoundException('User not found.');
        }

        return user;
    }

    /**
     * Actualiza el perfil del usuario autenticado (username y/o description).
     * @param userId El ID del usuario autenticado (extraído del JWT payload).
     * @param updateData Los datos a actualizar (UpdateUserDto).
     * @returns El usuario actualizado.
     */
    async updateUser(userId: string, updateData: UpdateUserDto): Promise<Partial<User>> {
        // 1. Obtener el usuario
        const user = await this.usersRepository.findOneBy({ user_id: userId });

        if (!user) {
            throw new NotFoundException('User not found.');
        }

        // 2. Validar y actualizar username
        if (updateData.username && updateData.username !== user.username) {
            const capitalizedUsername = updateData.username.charAt(0).toUpperCase() + updateData.username.slice(1);

            // Verificar unicidad
            const existingUser = await this.usersRepository.findOne({
                where: { username: capitalizedUsername }
            });

            if (existingUser) {
                throw new ConflictException('This username is already in use.');
            }

            user.username = capitalizedUsername;
        }

        // 3. Actualizar description
        if (updateData.description !== undefined) {
            user.description = updateData.description;
        }

        // 4. Actualizar avatarUrl
        if (updateData.avatarUrl !== undefined) {
            user.avatarUrl = updateData.avatarUrl;
        }

        // 5. Comprobación de cambios
        if (!updateData.username && updateData.description === undefined && updateData.avatarUrl === undefined) {
            throw new BadRequestException('No update fields provided or values are the same.');
        }


        try {
            // 6. Guardar cambios
            const savedUser = await this.usersRepository.save(user);

            // 7. Devolver solo campos seguros
            const { password, ...result } = savedUser;
            return {
                user_id: result.user_id,
                username: result.username,
                email: result.email,
                avatarUrl: result.avatarUrl,
                description: result.description,
            };

        } catch (error) {
            console.error('Error al guardar la actualización del usuario:', error);
            throw new Error('Failed to save user updates.');
        }
    }



    async remove(id: string): Promise<void> {
        await this.dataSource.transaction(async manager => {
            // 1️⃣ Traer usuario con todas las relaciones necesarias
            const user = await manager.findOne(User, {
                where: { user_id: id },
                relations: [
                    'channel',
                    'playlists',
                    'comments',
                    'likes',
                    'subscriptions',
                    'sentFriendships',
                    'receivedFriendships',
                    'sentNotifications',
                    'receivedNotifications',
                    'messages',
                    'roomsAsUser1',
                    'roomsAsUser2',
                ],
            });

            if (!user) throw new NotFoundException('User not found');

            // console.log('Rooms como user1:', user.roomsAsUser1.map(r => r.room_id));
            // console.log('Rooms como user2:', user.roomsAsUser2.map(r => r.room_id));

            // Eliminar todas las rooms donde el usuario es user1 o user2
            const roomsToDelete = [...user.roomsAsUser1, ...user.roomsAsUser2];
            if (roomsToDelete.length > 0) {
                await manager.remove(Room, roomsToDelete);
            }

            // Eliminar canal si existe
            if (user.channel) {
                await this.channelsService.remove(user.channel.channel_id);
            }

            // Eliminar usuario (cascade elimina mensajes enviados, playlists, comentarios, etc.)
            await manager.remove(User, user);
        });
    }

    // Verificacion de mail
    async sendVerificationEmail(newUserEmail: string, verificationLink: string) {
        console.log(`📨 Preparando email de verificación con Resend...`);
        console.log(`➡️ Destinatario: ${newUserEmail}`);
        console.log(`➡️ Link: ${verificationLink}`);

        try {
            const resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));

            const { data, error } = await resend.emails.send({
                from: "CaTube Team <onboarding@resend.dev>",
                to: newUserEmail,
                subject: 'Verify your user',
                html: `
                <p>Welcome to CaTube!</p>
                <p>Please click the button below to verify your account:</p>
                <a href="${verificationLink}"
                   style="background:#90b484;padding:10px 20px;border-radius:30px;
                   color:#1a1a1b;text-decoration:none;font-weight:bold;">
                    Verify
                </a>
                <p>If the button doesn't work, copy this link:</p>
                <p>${verificationLink}</p>
            `
            });

            if (error) {
                console.error('❌ Error enviando email con Resend:', error);
                throw new Error('Email sending failed.');
            }

            console.log('✅ Email enviado correctamente con Resend:', data);

        } catch (error) {
            console.error('❌ Error inesperado al enviar el email:', error);
            throw error;
        }
    }

    // Resetear contraseña

    // Buscar por email
    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    // Actualizar datos del usuario
    async update(id: string, data: Partial<User>): Promise<User | null> {
        await this.usersRepository.update(id, data);
        return this.usersRepository.findOne({ where: { user_id: id } });
    }

    // Buscar usuario por token de reseteo
    async findOneByResetToken(token: string): Promise<User | null> {
        const users = await this.usersRepository.find();

        for (const user of users) {
            if (!user.reset_password_token) continue;
            const isMatch = await bcrypt.compare(token, user.reset_password_token);
            if (isMatch) return user;
        }

        return null;
    }

    /**
     * Paso 1: Enviar correo con link de restablecimiento
     */
    async sendPasswordResetEmail(email: string): Promise<void> {
        // Buscar usuario
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            // Por seguridad, no revelar si existe o no
            return;
        }

        // Generar token único
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

        // Guardar token y expiración
        user.reset_password_token = resetToken;
        user.reset_token_expiry = expiry;
        await this.usersRepository.save(user);

        // Construir la URL del enlace (configurable desde .env)
        const BASE_RESET_URL = this.configService.get<string>('BACKEND_RESET_URL');
        const resetUrl = `${BASE_RESET_URL}?token=${resetToken}`;

        // Enviar correo
        await this.sendResetPasswordEmail(user.email, resetUrl);
    }

    /**
     * Paso 2: Validar token (usado cuando el usuario abre el link)
     */
    async validateResetToken(token: string): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { reset_password_token: token },
        });

        if (!user) {
            throw new NotFoundException('Token inválido o ya utilizado.');
        }

        if (user.reset_token_expiry && user.reset_token_expiry < new Date()) {
            throw new ConflictException('El token ha expirado.');
        }

        return user;
    }

    /**
     * Paso 3: Restablecer la contraseña
     */
    async resetPassword(token: string, newPassword: string): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { reset_password_token: token },
        });

        if (!user) {
            throw new NotFoundException('Token inválido o ya utilizado.');
        }

        if (user.reset_token_expiry && user.reset_token_expiry < new Date()) {
            throw new ConflictException('El token ha expirado.');
        }

        // Hashear la nueva contraseña
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(newPassword, salt);

        // Limpiar campos del token
        user.reset_password_token = null;
        user.reset_token_expiry = null;

        return this.usersRepository.save(user);
    }

    /**
     * Enviar correo de restablecimiento
     */
    async sendResetPasswordEmail(userEmail: string, resetLink: string) {
        console.log(`📨 Preparando email de reset con Resend...`);
        console.log(`➡️ Destinatario: ${userEmail}`);
        console.log(`➡️ Link: ${resetLink}`);

        try {
            const resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));

            const { data, error } = await resend.emails.send({
                from: "CaTube Team <onboarding@resend.dev>",
                to: userEmail,
                subject: 'Reset your password',
                html: `
                <p>Forgot your password?</p>
                <a href="${resetLink}"
                   style="background:#90b484;padding:10px 20px;border-radius:30px;
                   color:#1a1a1b;text-decoration:none;font-weight:bold;">
                    Reset password
                </a>
                <p>If the button doesn't work, copy this link:</p>
                <p>${resetLink}</p>
                <p>This link expires in 15 minutes.</p>
            `
            });

            if (error) {
                console.error('❌ Error enviando email con Resend:', error);
                throw new Error('Reset email sending failed.');
            }

            console.log('✅ Reset email enviado correctamente con Resend:', data);

        } catch (error) {
            console.error('❌ Error inesperado al enviar el email:', error);
            throw error;
        }
    }

}