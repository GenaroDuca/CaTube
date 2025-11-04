// src/messages/messages.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async create(senderId: string, roomId: string, content: string): Promise<Message> {
        const sender = await this.userRepository.findOneBy({ user_id: senderId });

        if (!sender) throw new NotFoundException('Remitente no encontrado.');

        const message = this.messageRepository.create({
            content,
            senderId,
            roomId,
            sender,
        });

        // Asegúrate de que tu entidad Message tiene un campo 'id' (UUID o similar)
        return this.messageRepository.save(message);
    }

    async findOne(messageId: string): Promise<Message> {
        // Busca el mensaje por su ID y trae las relaciones necesarias (aunque solo necesitamos el senderId/roomId)
        const message = await this.messageRepository.findOne({
            where: { message_id: messageId },
            // Solo necesitamos el senderId y roomId, no la entidad completa del remitente
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
            // Esto solo debería ocurrir si findOne ya falló
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