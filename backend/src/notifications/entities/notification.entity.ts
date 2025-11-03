// src/notifications/entities/notification.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Asumimos la entidad User

export enum NotificationType {
    FRIEND_REQUEST = 'friend_request',
    FRIEND_ACCEPTED = 'friend_accepted',
    NEW_MESSAGE = 'new_message',
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    notification_id: string;

    userId: string;
    senderId: string;

    @ManyToOne(() => User, user => user.receivedNotifications, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    receiver: User;

    @ManyToOne(() => User, user => user.sentNotifications)
    @JoinColumn({ name: 'sender_id' })
    sender: User;

    @Column({
        type: 'enum',
        enum: NotificationType,
        default: NotificationType.FRIEND_REQUEST,
    })
    type: NotificationType;

    @Column({ type: 'varchar', length: 255 })
    content: string;

    @Column({ name: 'is_read', default: false })
    isRead: boolean;

    @Column({ name: 'link_target', type: 'varchar', length: 100 })
    linkTarget: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}