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

    // --- ORDEN CORRECTO ---
    @Column('uuid')
    senderId: string;

    @ManyToOne(() => User, user => user.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'senderId' })
    sender: User;

    @ManyToOne(() => User, user => user.receivedMessages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'receiver_id' })
    receiver: User;


    // --- ORDEN CORRECTO ---
    @Column('varchar', { length: 75 })
    roomId: string;

    @ManyToOne(() => Room, room => room.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'roomId' })
    room: Room;
}
