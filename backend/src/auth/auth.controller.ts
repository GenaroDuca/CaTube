// src/auth/auth.controller.ts
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto-auth/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async signIn(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            // Este throw maneja las credenciales inválidas.
            throw new UnauthorizedException('Invalid credentials');
        }
        // Devuelve: { access_token: "...", user: {...} }
        return this.authService.login(user); 
    }
}