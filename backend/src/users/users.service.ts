import {
    Injectable,
    Inject,
    forwardRef,
    ConflictException,
    NotFoundException,
    BadRequestException
} from '@nestjs/common';
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
    private resend: Resend;
    private mailFrom: string;

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,

        @Inject(forwardRef(() => ChannelsService))
        private channelsService: ChannelsService,

        private readonly configService: ConfigService,
        private readonly dataSource: DataSource,
    ) {
        // Inicializa Resend
        this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
        this.mailFrom = this.configService.get<string>('MAIL_FROM');

        this.findAll();
    }

    // ================================================================
    // CREAR USUARIO
    // ================================================================
    async create(createUserDto: CreateUserDto): Promise<User> {
        const capitalizedUsername =
            createUserDto.username.charAt(0).toUpperCase() +
            createUserDto.username.slice(1);

        // Verificar username existente
        if (await this.usersRepository.findOne({ where: { username: capitalizedUsername } })) {
            throw new ConflictException('Username already exists');
        }

        // Verificar email existente
        if (await this.usersRepository.findOne({ where: { email: createUserDto.email } })) {
            throw new ConflictException('Email already exists');
        }

        // Hash contraseña + token
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 24 * 3600 * 1000);

        const newUser = this.usersRepository.create({
            username: capitalizedUsername,
            email: createUserDto.email,
            password: hashedPassword,
            is_verified: false,
            verification_token: token,
            token_expiry: expiry,
        });

        try {
            const savedUser = await this.usersRepository.save(newUser);

            const BASE_VERIFY_URL = this.configService.get<string>('BACKEND_VERIFY_URL');
            const verificationUrl = `${BASE_VERIFY_URL}?token=${token}`;

            await this.sendVerificationEmail(savedUser.email, verificationUrl);

            // Crear canal
            await this.channelsService.create(
                {
                    channel_name: savedUser.username,
                    description: `Bienvenido al canal de ${savedUser.username}`,
                    url: savedUser.username.toLowerCase(),
                },
                savedUser
            );

            return savedUser;
        } catch (error) {
            const uniqueCode = '23505';
            if (error instanceof QueryFailedError && (error as any).code === uniqueCode) {
                throw new ConflictException('Duplicated user data');
            }
            throw error;
        }
    }

    // ================================================================
    // VERIFICACIÓN EMAIL
    // ================================================================
    async verifyEmail(token: string): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { verification_token: token }
        });

        if (!user) throw new NotFoundException('Token inválido.');

        if (user.is_verified) return user;

        if (user.token_expiry && user.token_expiry < new Date()) {
            throw new ConflictException('Token expirado.');
        }

        user.is_verified = true;
        user.verification_token = null;
        user.token_expiry = null;

        return this.usersRepository.save(user);
    }

    // ================================================================
    // MÉTODOS EXISTENTES
    // ================================================================
    findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async findOneByUsername(username: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { username },
            relations: ['channel'],
        });
    }

    async searchUsers(query: string): Promise<Partial<User>[]> {
        const users = await this.usersRepository.find({
            where: { username: Like(`%${query}%`) },
            select: ['user_id', 'username', 'email'],
        });

        return users.map(u => ({
            user_id: u.user_id,
            username: u.username,
        }));
    }

    findOneById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { user_id: id },
            relations: ['channel'],
        });
    }

    async findMe(userId: string): Promise<Partial<User>> {
        const user = await this.usersRepository.findOne({
            where: { user_id: userId },
            select: ['user_id', 'username', 'email', 'avatarUrl', 'description', 'is_verified'],
            relations: ['channel'],
        });

        if (!user) throw new NotFoundException('User not found.');

        return user;
    }

    async updateUser(userId: string, updateData: UpdateUserDto): Promise<Partial<User>> {
        const user = await this.usersRepository.findOneBy({ user_id: userId });
        if (!user) throw new NotFoundException('User not found.');

        if (updateData.username && updateData.username !== user.username) {
            const newUsername =
                updateData.username.charAt(0).toUpperCase() +
                updateData.username.slice(1);

            const exists = await this.usersRepository.findOne({
                where: { username: newUsername },
            });

            if (exists) throw new ConflictException('Username already in use.');

            user.username = newUsername;
        }

        if (updateData.description !== undefined)
            user.description = updateData.description;

        if (updateData.avatarUrl !== undefined)
            user.avatarUrl = updateData.avatarUrl;

        const saved = await this.usersRepository.save(user);

        const { password, ...result } = saved;
        return result;
    }

    async remove(id: string): Promise<void> {
        await this.dataSource.transaction(async manager => {
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

            const rooms = [...user.roomsAsUser1, ...user.roomsAsUser2];
            if (rooms.length > 0) await manager.remove(Room, rooms);

            if (user.channel)
                await this.channelsService.remove(user.channel.channel_id);

            await manager.remove(User, user);
        });
    }

    // ================================================================
    // ENVÍO DE EMAIL - RESEND
    // ================================================================
    async sendVerificationEmail(userEmail: string, verificationLink: string) {
        try {
            await this.resend.emails.send({
                from: this.mailFrom,
                to: userEmail,
                subject: "Verify your CaTube account",
                html: `
                    <p>Welcome to CaTube!</p>
                    <p>Please verify your account:</p>
                    <a href="${verificationLink}" style="padding:10px 20px;background:#90b484;color:#000;border-radius:20px;font-weight:bold;text-decoration:none;">
                        Verify
                    </a>
                    <p>If it doesn't work, use this link:</p>
                    <p>${verificationLink}</p>
                `,
            });
        } catch (error) {
            console.error('Error sending verification email:', error);
            throw new Error('Email sending failed.');
        }
    }

    // ================================================================
    // RESET PASSWORD EMAIL
    // ================================================================
    async sendPasswordResetEmail(email: string): Promise<void> {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) return;

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        user.reset_password_token = resetToken;
        user.reset_token_expiry = expiry;
        await this.usersRepository.save(user);

        const BASE_RESET_URL = this.configService.get<string>('BACKEND_RESET_URL');
        const resetUrl = `${BASE_RESET_URL}?token=${resetToken}`;

        await this.sendResetPasswordEmail(user.email, resetUrl);
    }

    async validateResetToken(token: string): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { reset_password_token: token },
        });

        if (!user) throw new NotFoundException('Token inválido.');
        if (!user.reset_token_expiry || user.reset_token_expiry < new Date()) {
            throw new ConflictException('Token expirado.');
        }
        return user;
    }

    async resetPassword(token: string, newPassword: string): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { reset_password_token: token },
        });

        if (!user) throw new NotFoundException('Token inválido.');
        if (!user.reset_token_expiry || user.reset_token_expiry < new Date()) {
            throw new ConflictException('Token expirado.');
        }
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(newPassword, salt);

        user.reset_password_token = null;
        user.reset_token_expiry = null;

        return this.usersRepository.save(user);
    }

    async sendResetPasswordEmail(userEmail: string, resetLink: string) {
        try {
            await this.resend.emails.send({
                from: this.mailFrom,
                to: userEmail,
                subject: "Reset your CaTube password",
                html: `
                    <p>You requested a password reset.</p>
                    <a href="${resetLink}" style="padding:10px 20px;background:#90b484;color:#000;border-radius:20px;font-weight:bold;text-decoration:none;">
                        Reset Password
                    </a>
                    <p>If it doesn’t work, use this link:</p>
                    <p>${resetLink}</p>
                `,
            });
        } catch (error) {
            console.error('Error sending reset email:', error);
            throw new Error('Error sending password reset email.');
        }
    }
}
