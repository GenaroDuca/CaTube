import { Body, Controller, Get, Post, Delete, Param, Query, Res, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto-users/create-user.dto';
import { UsersService } from './users.service';
import { Response } from 'express'; 
import { ConfigService } from '@nestjs/config';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService // Inyectamos ConfigService para obtener URLs
    ) { }

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @UseGuards(JwtAuthGuard) 
    @Get('me')
    async getMe(@Req() req) {
        const userId = req.user.id;

        return this.usersService.findMe(userId);
    }

    @Get('verify-email')
    async verifyEmail(@Query('token') token: string, @Res() res: Response) {
        // 1. Definir las URLs de redirección del frontend (desde .env)
        const SUCCESS_URL = this.configService.get('FRONTEND_VERIFY_SUCCESS_URL');
        const ERROR_URL = this.configService.get('FRONTEND_VERIFY_ERROR_URL');

        if (!token) {
            // Si el token falta, redirigimos a una URL de error genérica.
            return res.redirect(`${ERROR_URL}?reason=no_token`);
        }

        try {
            // 2. Llamar a la lógica de verificación del Service
            await this.usersService.verifyEmail(token);

            // 3. Verificación exitosa: Redirigir al frontend a la página de éxito
            return res.redirect(SUCCESS_URL);

        } catch (error) {
            let reason = 'internal_error';

            // 4. Manejo de errores específicos del Service
            if (error instanceof NotFoundException) {
                // Token no encontrado o ya usado
                reason = 'invalid_token';
            } else if (error instanceof ConflictException) {
                // Token caducado
                reason = 'expired';
            } else {
                console.error("Error inesperado en verifyEmail:", error);
            }

            // 5. Redirigir al frontend a la página de error con un motivo
            return res.redirect(`${ERROR_URL}?reason=${reason}`);
        }
    }

    @Get("all")
    async getAllUsers() {
        return this.usersService.findAll();
    }


    @Get('search')
    async searchUsers(@Query('q') query: string) {
        if (!query || query.length < 2) {
            return [];
        }

        return this.usersService.searchUsers(query);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}