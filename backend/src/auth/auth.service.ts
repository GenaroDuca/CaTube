import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

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

                // VERIFICACIÓN DE CORREO ELECTRÓNICO
                if (!user.is_verified) {
                    // Si el usuario existe y la contraseña es correcta, pero is_verified es FALSE,
                    // lanza una excepción 401 que NestJS maneja.
                    throw new UnauthorizedException('Please verify your email address to log in.');
                }

                // 4. Si todo es válido, devolvemos el usuario (excluyendo la contraseña para el token JWT)
                const { password, ...result } = user;
                return result;
            }
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.user_id };
        return {
            access_token: this.jwtService.sign(payload),
            user: user
        };
    }
}