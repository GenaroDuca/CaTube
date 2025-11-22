import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) { }

  // --- 1. Crear notificación ---
  async createNotification(
    receiverId: string,
    senderId: string | null,
    type: NotificationType,
    content: string,
    linkTarget: string
  ): Promise<Notification | null> {
    try {
      const newNotificationData = {
        // 🚨 FIX CLAVE: Usamos las propiedades de ID explícitas
        receiverId: receiverId, 
        senderId: senderId,
        
        type: type,
        content: content,
        linkTarget: linkTarget,
        isRead: false,
      };

      const result = await this.notificationRepository.insert(newNotificationData);

      const insertedId = result.identifiers[0].notification_id;

      return await this.notificationRepository.findOne({ 
        where: { notification_id: insertedId } as any,
        relations: ['receiver', 'sender']
      });

    } catch (error) {
      console.error('Error saving notification:', error);
      // Lanzamos la excepción después de loguear
      throw new InternalServerErrorException('Failed to create notification.');
    }
  }

  // --- 2. Obtener notificaciones ---
  async findNotificationsByUserId(
    userId: string,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {

    try {
      const qb = this.notificationRepository.createQueryBuilder('notification')
        // Hacemos JOIN explícito con 'receiver' y 'sender'
        .leftJoinAndSelect('notification.receiver', 'receiver')
        .leftJoinAndSelect('notification.sender', 'sender')
        .where('notification.receiverId = :userId', { userId })
        .orderBy('notification.createdAt', 'DESC')
        .take(limit);

      if (unreadOnly) {
        qb.andWhere('notification.isRead = :isRead', { isRead: false });
      }

      return await qb.getMany();

    } catch (error) {
      console.error('Error finding notifications:', error);
      throw new InternalServerErrorException('Could not fetch notifications');
    }
  }

  // --- 3. Marcar como leída ---
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: {
        notification_id: notificationId,
        // 🚨 FIX CLAVE: Usamos el ID de la FK
        receiverId: userId 
      } as any
    });

    if (!notification) {
      throw new NotFoundException('Notification not found or unauthorized.');
    }

    notification.isRead = true;
    await this.notificationRepository.save(notification);
  }

  // --- 4. Marcar todas como leídas ---
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where("receiverId = :userId", { userId })
      .andWhere("is_read = :isRead", { isRead: false })
      .execute();
  }

  // --- 5. Eliminar notificación ---
  async remove(notificationId: string, userId: string): Promise<void> {
    const result = await this.notificationRepository.delete({
      notification_id: notificationId,
      receiverId: userId
    } as any);

    if (result.affected === 0) {
      throw new NotFoundException(`Notification not found`);
    }
  }

  // --- 6. Mapear a DTO ---
  mapToDto(notification: Notification): CreateNotificationDto {
    const dto = new CreateNotificationDto();

    dto.notification_id = notification.notification_id;
    dto.type = notification.type;
    dto.content = notification.content;
    dto.isRead = notification.isRead;
    dto.linkTarget = notification.linkTarget;
    dto.createdAt = notification.createdAt ? notification.createdAt.toISOString() : new Date().toISOString();

    dto.sender = {
      // Usamos la relación 'sender' para obtener los datos.
      senderId: notification.sender?.user_id || notification.senderId || null,
      username: notification.sender?.username || 'Sistema',
      avatarUrl: notification.sender?.avatarUrl || null,
    };

    return dto;
  }
}