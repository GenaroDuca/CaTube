import { Controller, Post, Body, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto-auth/auth.dto';
import { UsersService } from '../users/users.service';
import { BadRequestException, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService) {
    }

    @Post('login')
    async signIn(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        // Devuelve: access_token
        return this.authService.login(user);
    }
    
    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        if (!email) throw new BadRequestException('Email requerido');
        await this.usersService.sendPasswordResetEmail(email);
        return {
            message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.'
        };
    }

    @Get('reset-password')
    async verifyResetToken(@Query('token') token: string, @Res() res: Response) {
        const SUCCESS_URL = this.configService.get('FRONTEND_RESET_URL');
        const ERROR_URL = this.configService.get('FRONTEND_VERIFY_ERROR_URL');

        if (!token) return res.redirect(`${ERROR_URL}?reason=no_token`);

        try {
            await this.usersService.validateResetToken(token);
            // redirige al frontend con el token en query
            return res.redirect(`${SUCCESS_URL}?token=${token}`);
        } catch (error) {
            let reason = 'internal_error';
            if (error instanceof NotFoundException) reason = 'invalid_token';
            else if (error instanceof ConflictException) reason = 'expired';
            return res.redirect(`${ERROR_URL}?reason=${reason}`);
        }
    }

    @Post('reset-password')
    async resetPassword(@Body() body: { token: string; newPassword: string }) {
        const { token, newPassword } = body;
        if (!token || !newPassword) throw new BadRequestException('Token y nueva contraseña requeridos');

        await this.usersService.resetPassword(token, newPassword);
        return { message: 'Contraseña actualizada correctamente.' };
    }

}