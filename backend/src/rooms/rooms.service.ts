import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RoomsService {
    constructor(
        @InjectRepository(Room)
        private roomRepository: Repository<Room>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }


    async getOrCreatePrivateRoom(userAId: string, userBId: string): Promise<Room> {
        // 1. Validación inicial
        if (userAId === userBId) {
            throw new ConflictException("No puedes crear un chat contigo mismo.");
        }

        // 2. Obtener usuarios (Pre-requisito para crear la relación)
        const [userA, userB] = await Promise.all([
            this.userRepository.findOneBy({ user_id: userAId }),
            this.userRepository.findOneBy({ user_id: userBId }),
        ]);

        if (!userA || !userB) {
            throw new NotFoundException("Uno o ambos usuarios no existen.");
        }

        // 3. Ordenar usuarios para inserción consistente
        let [firstUser, secondUser] =
            userA.user_id < userB.user_id ? [userA, userB] : [userB, userA];

        try {
            const room = this.roomRepository.create({
                type: 'private',
                user1: firstUser,
                user2: secondUser,
            });
            return await this.roomRepository.save(room);

        } catch (error) {

            if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                const existingRoom = await this.roomRepository
                    .createQueryBuilder('room')
                    .leftJoinAndSelect('room.user1', 'user1')
                    .leftJoinAndSelect('room.user2', 'user2')
                    .leftJoinAndSelect('room.messages', 'messages')
                    .where(
                        '(user1.user_id = :userAId AND user2.user_id = :userBId)', // Orden A-B
                        { userAId, userBId }
                    )
                    .orWhere(
                        '(user1.user_id = :userBId AND user2.user_id = :userAId)', // Orden B-A
                        { userAId, userBId }
                    )
                    .getOne();

                if (existingRoom) {
                    // Sala existente encontrada, la retornamos y se resuelve el error.
                    return existingRoom;
                }

                throw new InternalServerErrorException("Error de concurrencia: Duplicado detectado, pero la sala existente no pudo ser recuperada.");

            }

            throw error;
        }
    }
    
    /**
     * Devuelve todas las rooms de un usuario
     */
    async findAllRoomsByUserId(userId: string): Promise<Room[]> {
        const user = await this.userRepository.findOne({
            where: { user_id: userId },
            relations: ['roomsAsUser1', 'roomsAsUser2', 'roomsAsUser1.messages', 'roomsAsUser2.messages'],
        });

        if (!user) return [];

        return [...user.roomsAsUser1, ...user.roomsAsUser2];
    }
}
