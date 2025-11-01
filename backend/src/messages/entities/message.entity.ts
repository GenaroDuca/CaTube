import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn("uuid")
    message_id: string;

    @Column({ type: 'text' })
    content: string;

    @CreateDateColumn({ type: 'timestamp' })
    timestamp: Date;

    @Column({ type: 'boolean', default: false, name: 'is_edited' })
    is_edited: boolean; 

    @ManyToOne(() => User, user => user.messages)
    @JoinColumn({ name: 'senderId' })
    sender: User;
    @Column('uuid')
    senderId: string; // Clave foránea

    @ManyToOne(() => Room, room => room.messages)
    @JoinColumn({ name: 'roomId' })
    room: Room;
    @Column('varchar', { length: 75 }) 
    roomId: string; // Clave foránea 
}