// src/messages/messages.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { Room } from '../rooms/entities/room.entity';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Room)
        private roomRepository: Repository<Room>,

        private readonly notificationsService: NotificationsService,
    ) { }

    async create(senderId: string, roomId: string, content: string): Promise<Message> {
        const sender = await this.userRepository.findOneBy({ user_id: senderId });

        if (!sender) throw new NotFoundException('Remitente no encontrado.');

        // 1. CARGAR LA SALA INCLUYENDO user1 y user2
        const room = await this.roomRepository.findOne({
            where: { room_id: roomId },
            relations: ['user1', 'user2'],
        });

        if (!room) throw new NotFoundException('Sala de chat no encontrada.');

        // 2. ENCONTRAR EL RECEIVER ID
        let receiverId: string;
        if (room.user1.user_id === senderId) {
            receiverId = room.user2.user_id;
        } else if (room.user2.user_id === senderId) {
            receiverId = room.user1.user_id;
        } else {
            throw new NotFoundException('El remitente no es parte de esta sala.');
        }

        // Creación y guardado del mensaje ---
        const message = this.messageRepository.create({
            content,
            senderId,
            roomId,
            sender,
        });

        const savedMessage = await this.messageRepository.save(message);

        // 3. ENVIAR NOTIFICACIÓN AL RECEPTOR
        try {
            await this.notificationsService.createNotification(
                receiverId,
                senderId,
                NotificationType.MESSAGE,
                'sent you a message!',
                `/profile/${senderId}`,
            );
        } catch (e) {
            console.error('Failed to create MESSAGE notification:', e);
        }

        return savedMessage;
    }

    async findOne(messageId: string): Promise<Message> {
        const message = await this.messageRepository.findOne({
            where: { message_id: messageId },
            select: ['message_id', 'senderId', 'roomId'],
        });

        if (!message) {
            throw new NotFoundException(`Mensaje con ID ${messageId} no encontrado.`);
        }

        return message;
    }

    async delete(messageId: string): Promise<void> {
        const result = await this.messageRepository.delete(messageId);

        if (result.affected === 0) {
            throw new NotFoundException(`Mensaje con ID ${messageId} no pudo ser eliminado.`);
        }
    }

    async updateContent(messageId: string, newContent: string): Promise<Message> {
        const message = await this.messageRepository.findOne({
            where: { message_id: messageId }
        });

        if (!message) {
            throw new NotFoundException(`Mensaje con ID ${messageId} no encontrado.`);
        }

        message.content = newContent;
        message.is_edited = true;

        const updatedMessage = await this.messageRepository.save(message);

        return updatedMessage;
    }

    async findRoomHistory(
        roomId: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<Message[]> {

        return this.messageRepository.find({
            where: { roomId },
            relations: ['sender'],
            order: { timestamp: 'DESC' },
            take: limit,
            skip: offset,
        });
    }

}