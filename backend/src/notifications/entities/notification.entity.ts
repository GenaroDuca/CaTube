// src/notifications/entities/notification.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity'; 

export enum NotificationType {
    FRIEND_REQUEST = 'friend_request',
    FRIEND_ACCEPTED = 'friend_accepted',
    NEW_SUBSCRIPTION = 'new_subscription',
    NEW_COMMENT = 'new_comment',
    LIKE_VIDEO = 'like_video',
    NEW_VIDEO = 'new_video',
    LIKE_COMMENT = 'like_comment',
    WELCOME = 'welcome', 
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    notification_id: string;

    // --- CLAVES FORÁNEAS EXPLÍCITAS ---

    @Column({ name: 'receiver_id' })
    receiverId: string;

    @Column({ name: 'sender_id', nullable: true })
    senderId: string | null;

    // --- RELACIONES CLAVE  ---
    
    // El dueño de la notificación (Receptor)
    @ManyToOne(() => User, user => user.receivedNotifications, { onDelete: 'CASCADE' })
    @JoinColumn({ 
        name: 'receiver_id', 
        referencedColumnName: 'user_id' 
    }) 
    receiver: User;

    // El usuario que causó la notificación
    @ManyToOne(() => User, user => user.sentNotifications, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ 
        name: 'sender_id',
        referencedColumnName: 'user_id'
    }) 
    sender: User;
    
    // --- DATOS ADICIONALES PARA REFERENCIA ---
    
    @Column({ name: 'video_id', type: 'uuid', nullable: true })
    videoId: string | null; 
    
    @Column({ name: 'comment_id', type: 'uuid', nullable: true })
    commentId: string | null; 
    
    // --- PROPIEDADES BASE ---

    @Column({
        type: 'enum',
        enum: NotificationType,
        default: NotificationType.WELCOME,
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