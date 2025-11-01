import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RoomsService {
    constructor(
        @InjectRepository(Room)
        private roomRepository: Repository<Room>,
        @InjectRepository(User) // Inyectamos User temporalmente para obtener participantes
        private userRepository: Repository<User>,
    ) { }

    private generatePrivateRoomIdentifier(userAId: string, userBId: string): string {
        if (!userAId || !userBId) {
            throw new Error("Cannot generate Room ID: One of the user IDs is missing.");
        }

        const sortedIds = [userAId, userBId].sort();
        return `${sortedIds[0]}_${sortedIds[1]}`;
    }

    async getOrCreatePrivateRoom(userAId: string, userBId: string): Promise<Room> {
        const roomIdentifier = this.generatePrivateRoomIdentifier(userAId, userBId);

        let room = await this.roomRepository.findOne({
            where: { room_id: roomIdentifier },
            relations: ['participants']
        });

        if (room) { return room; }

        const [userA, userB] = await Promise.all([
            this.userRepository.findOneBy({ user_id: userAId }),
            this.userRepository.findOneBy({ user_id: userBId }),
        ]);

        if (!userA || !userB) {
            throw new NotFoundException("Uno o ambos usuarios no existen.");
        }

        const newRoom = this.roomRepository.create({
            room_id: roomIdentifier,
            type: 'private',
            participants: [userA, userB]
        });

        return this.roomRepository.save(newRoom);
    }

    async findAllRoomsByUserId(userId: string): Promise<Room[]> {
        const user = await this.userRepository.findOne({
            where: { user_id: userId },
            relations: ['rooms'],
        });

        return user ? user.rooms : [];
    }
}