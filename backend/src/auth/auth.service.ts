// src/auth/auth.service.ts
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
}