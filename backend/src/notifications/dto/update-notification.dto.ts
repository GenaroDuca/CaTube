import { IsBoolean, IsNotEmpty } from 'class-validator';

// Usado para marcar una notificación como leída (PATCH /notifications/:id)
export class UpdateNotificationDto {
    @IsNotEmpty()
    @IsBoolean()
    isRead: boolean;
}