import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { addMinutes } from 'date-fns';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {

        // 1. Buscar al usuario por username
        const user = await this.usersService.findOneByUsername(username);

        if (user) {
            // 2. Comprobar la contraseña
            const isPasswordValid = await bcrypt.compare(pass, user.password);

            if (isPasswordValid) {
                if (!user.is_verified) {
                    throw new UnauthorizedException('Please verify your email address to log in.');
                }
                // 4. Si todo es válido, devolvemos el usuario (excluyendo la contraseña)
                // Usamos 'user_id' como identificador, que se mapea a 'sub' en el payload.
                const { password, ...result } = user;
                return result;
            }
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.user_id, id: user.user_id };

        // Retorna el token y el objeto de usuario (sin password)
        return {
            access_token: this.jwtService.sign(payload),
            user: user
        };
    }

    async sendResetPasswordLink(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) return;

        const token = randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(token, 10);
        const expires = addMinutes(new Date(), 15);

        await this.usersService.update(user.user_id, {
            reset_password_token: hashedToken,
            reset_token_expiry: expires
        });

        const frontendResetUrl = process.env.FRONTEND_RESET_URL;
        const resetUrl = `${frontendResetUrl}?token=${token}`;

        await this.usersService.sendResetPasswordEmail(user.email, resetUrl);
    }

    async validateResetToken(token: string) {
        const user = await this.usersService.findOneByResetToken(token);
        if (!user) {
            throw new NotFoundException('Token inválido o ya utilizado');
        }

        // Validamos expiración (si existe la fecha)
        if (user.reset_token_expiry && user.reset_token_expiry < new Date()) {
            throw new ConflictException('El token ha expirado');
        }

        return user;
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.usersService.findOneByResetToken(token);
        if (!user) {
            throw new NotFoundException('Token inválido o expirado');
        }

        if (user.reset_token_expiry && user.reset_token_expiry < new Date()) {
            throw new ConflictException('El token ha expirado');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.usersService.update(user.user_id, {
            password: hashedPassword,
            reset_password_token: null,
            reset_token_expiry: null,
        });

        return user;
    }


}