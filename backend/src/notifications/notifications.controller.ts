import { Controller, Get, Patch, Delete, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { NotificationsService } from './notifications.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

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

    @Patch('mark-all-read')
    @HttpCode(HttpStatus.NO_CONTENT) 
    async markAllAsRead(@Req() req: any): Promise<void> {
        const userId = req.user.id;
        await this.notificationsService.markAllAsRead(userId);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.NO_CONTENT) 
    async updateReadStatus(
        @Param('id') notificationId: string, 
        @Body() updateDto: UpdateNotificationDto, 
        @Req() req: any
    ): Promise<void> {
        const userId = req.user.id;
        
        if (updateDto.isRead === undefined || typeof updateDto.isRead !== 'boolean') {
             throw new BadRequestException('The body must contain a boolean "isRead" field.');
        }

        await this.notificationsService.markAsRead(
            notificationId, 
            userId, 
        );
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('id') notificationId: string,
        @Req() req: any
    ): Promise<void> {
        const userId = req.user.id;
        await this.notificationsService.remove(notificationId, userId);
    }
}