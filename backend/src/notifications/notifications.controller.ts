// src/notifications/notifications.controller.ts

import { Controller, Get, Patch, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Tu guard
import { NotificationsService } from './notifications.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    /**
     * GET /api/notifications
     * Obtiene la lista de notificaciones para el usuario autenticado.
     */
    @Get()
    async findAll(
        @Req() req: any,
        @Query('limit') limit: string = '20',
        @Query('unreadOnly') unreadOnly: string = 'false',
    ): Promise<CreateNotificationDto[]> {
        const userId = req.user.id;
        const isUnreadOnly = unreadOnly.toLowerCase() === 'true';

        const notifications = await this.notificationsService.findNotificationsByUserId(
            userId, 
            parseInt(limit, 10), 
            isUnreadOnly
        );

        return notifications.map(n => this.notificationsService.mapToDto(n));
    }

    /**
     * PATCH /api/notifications/mark-all-read
     * Marca todas las notificaciones pendientes como leídas.
     */
    @Patch('mark-all-read')
    @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
    async markAllAsRead(@Req() req: any): Promise<void> {
        const userId = req.user.id;
        await this.notificationsService.markAllAsRead(userId);
    }

    /**
     * PATCH /api/notifications/:id
     * Marca una notificación específica como leída/no leída.
     */
    @Patch(':id')
    @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
    async updateReadStatus(
        @Param('id') notificationId: string, 
        @Body() updateDto: UpdateNotificationDto, // Valida que isRead es booleano
        @Req() req: any
    ): Promise<void> {
        const userId = req.user.id;
        
        // El DTO debe asegurar que updateDto.isRead es un booleano válido
        if (updateDto.isRead === undefined || typeof updateDto.isRead !== 'boolean') {
             throw new BadRequestException('The body must contain a boolean "isRead" field.');
        }

        await this.notificationsService.markAsRead(
            notificationId, 
            userId, 
        );
    }
}