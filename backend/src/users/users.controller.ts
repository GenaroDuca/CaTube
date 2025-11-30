import { Body, Controller, Get, Post, Delete, Param, Query, Res, ConflictException, NotFoundException, Patch, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto-users/create-user.dto';
import { ChannelsService } from 'src/channels/channels.service';
import { UsersService } from './users.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto-users/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { LikesService } from '../likes/likes.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly channelsService: ChannelsService,
        private readonly likesService: LikesService,
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

    @UseGuards(JwtAuthGuard)
    @Get("all")
    async getAllUsers() {
        return this.usersService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('search')
    async searchUsers(@Query('q') query: string) {
        if (!query || query.length < 2) {
            return [];
        }

        return this.usersService.searchUsers(query);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('me/change-password')
    async changePassword(@Req() req, @Body() body: { currentPassword: string; newPassword: string }) {
        const userId = req.user.id;
        await this.usersService.changePassword(userId, body.currentPassword, body.newPassword);
        return { success: true };
    }

    @UseGuards(JwtAuthGuard)
    @Post('me/avatar')
    @UseInterceptors(FileInterceptor('avatar'))
    async uploadAvatar(
        @Req() req,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Validate file type
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Only image files (JPEG, PNG, WebP) are allowed');
        }

        const userId = req.user.id;
        return this.usersService.uploadAvatar(userId, file);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(`me`)
    async updateMe(@Req() req, @Body() updateUserDto: UpdateUserDto) {
        const userId = req.user.id;
        return this.usersService.updateUser(userId, updateUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me/privacy')
    async updatePrivacy(@Req() req, @Body() body: { isPrivate: boolean }) {
        const userId = req.user.id;
        return this.usersService.setPrivacy(userId, body.isPrivate);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me/channel-visibility')
    async updateChannelVisibility(@Req() req, @Body() body: { isHidden: boolean }) {
        const userId = req.user.id;
        return this.channelsService.setVisibilityByUserId(userId, body.isHidden);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('me')
    async deleteMe(@Req() req, @Body() body: { password: string }) {
        const userId = req.user.id;
        await this.usersService.deleteMe(userId, body.password);
        return { success: true };
    }

    @UseGuards(JwtAuthGuard)
    @Post("feedback")
    async submitFeedback(@Req() req, @Body() body: { email?: string; feedback: string }) {
        if (!body.feedback) {
            throw new BadRequestException('Feedback is required');
        }

        const userId = req.user.id;

        await this.usersService.sendFeedbackEmail(userId, body.feedback);

        return { success: true, message: 'Feedback enviado correctamente' };
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/history')
    getHistory(@Param('id') id: string) {
        return this.usersService.getHistory(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/watchlater')
    getWatchLater(@Param('id') id: string) {
        return this.usersService.getWatchLater(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/liked')
    getLiked(@Param('id') id: string) {
        return this.likesService.findLikedVideosByUserId(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/history')
    addToHistory(@Param('id') id: string, @Body() body: { videoId: string }) {
        return this.usersService.addToHistory(id, body.videoId);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/watchlater')
    addToWatchLater(@Param('id') id: string, @Body() body: { videoId: string }) {
        return this.usersService.addToWatchLater(id, body.videoId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/watchlater/:videoId')
    removeFromWatchLater(@Param('id') id: string, @Param('videoId') videoId: string) {
        return this.usersService.removeFromWatchLater(id, videoId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('me/history/:videoId')
    removeFromHistory(@Req() req, @Param('videoId') videoId: string) {
        const userId = req.user.id;
        return this.usersService.removeFromHistory(userId, videoId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('me/history')
    clearHistory(@Req() req) {
        const userId = req.user.id;
        return this.usersService.clearHistory(userId);
    }
}
