// src/notifications/notifications.service.ts

import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';

import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,

  ) { }

  /**
   * 1. CORE: Crea y guarda una notificación en la DB.
   * Esta función debe ser llamada internamente por otros servicios (ej: FriendshipService).
   */
  async createNotification(
    receiverId: string,
    senderId: string,
    type: NotificationType,
    content: string,
    linkTarget: string
  ): Promise<Notification | null> {
    if (receiverId === senderId) return null; // No enviamos notificaciones a uno mismo
    try {
      const newNotification = this.notificationRepository.create({
        userId: receiverId,
        senderId: senderId,
        type: type,
        content: content,
        linkTarget: linkTarget,
        isRead: false,
      });

      return this.notificationRepository.save(newNotification);
    } catch (error) {
      console.error('Error saving notification:', error);
      throw new InternalServerErrorException('Failed to create notification.');
    }
  }

  /**
   * 2. Obtiene las notificaciones del usuario, incluyendo los datos del remitente.
   */
  async findNotificationsByUserId(
    userId: string,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    const whereCondition: any = { userId };
    if (unreadOnly) {
      whereCondition.isRead = false;
    }

    return this.notificationRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['sender'], // Carga el objeto 'sender' para mapear el DTO
    });
  }

  /**
   * 3. Marca una notificación específica como leída (usado por el Controller).
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    // Aseguramos que el usuario solo puede modificar sus propias notificaciones
    const result = await this.notificationRepository.update(
      { notification_id: notificationId, userId: userId },
      { isRead: true }
    );

    if (result.affected === 0) {
      throw new NotFoundException('Notification not found or unauthorized.');
    }
  }

  /**
   * 4. Marca todas las notificaciones pendientes como leídas.
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId: userId, isRead: false },
      { isRead: true }
    );
  }

  /**
   * 5. Mapea la Entidad a DTO para enviar al frontend.
   */
  mapToDto(notification: Notification): CreateNotificationDto {
    const dto = new CreateNotificationDto();
    dto.id = notification.userId;
    dto.type = notification.type;
    dto.content = notification.content;
    dto.isRead = notification.isRead;
    dto.linkTarget = notification.linkTarget;
    dto.createdAt = notification.createdAt.toISOString();

    // Mapeo seguro del remitente
    dto.sender = {
      id: notification.sender?.user_id,
      username: notification.sender?.username,
      avatarUrl: notification.sender?.avatarUrl,
    };

    return dto;
  }
}