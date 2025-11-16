import { Entity, Column, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Message } from '../../messages/entities/message.entity';

@Entity('rooms')
@Unique(['user1', 'user2'])
export class Room {
    @PrimaryGeneratedColumn('uuid')
    room_id: string;

    @Column({ type: 'varchar', default: 'private' })
    type: 'private';

    // Usuarios participantes: usuario1
    @ManyToOne(() => User, user => user.roomsAsUser1, { onDelete: 'CASCADE' })
    user1: User;

    // Usuarios participantes: usuario2
    @ManyToOne(() => User, user => user.roomsAsUser2, { onDelete: 'CASCADE' })
    user2: User;

    @OneToMany(() => Message, message => message.room, { cascade: true, onDelete: 'CASCADE' })
    messages: Message[];
}