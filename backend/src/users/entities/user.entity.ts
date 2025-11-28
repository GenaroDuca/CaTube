import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, Unique, ManyToMany } from 'typeorm';
import { Channel } from 'src/channels/entities/channel.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Subscription } from 'src/subs/entities/sub.entity';
import { Friendship } from 'src/friendships/entities/friendship.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Exclude } from 'class-transformer';
import { Room } from 'src/rooms/entities/room.entity';
import { Message } from 'src/messages/entities/message.entity';

@Unique(['username'])
@Entity('users')
export class User {
    @PrimaryGeneratedColumn("uuid")
    user_id: string;

    @Column()
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @CreateDateColumn()
    registration_date: Date;

    @Column({ name: 'user_type', default: 'client' })
    user_type: string;

    @Column({ name: 'is_verified', default: false })
    is_verified: boolean;

    @Column({ name: 'verification_token', nullable: true, unique: true, type: 'varchar', length: 255 })
    verification_token: string | null;

    @Column({ name: 'token_expiry', type: 'timestamp', nullable: true })
    token_expiry: Date | null;

    @Column({ type: 'varchar', nullable: true })
    reset_password_token: string | null;

    @Column({ type: 'timestamp', nullable: true })
    reset_token_expiry: Date | null;

    // -------------------------------------------------------
    @OneToOne(() => Channel, (channel) => channel.user, { onDelete: 'CASCADE' })
    channel: Channel;

    @OneToMany(() => Comment, (comment) => comment.user, { onDelete: 'CASCADE' })
    comments: Comment[];

    @OneToMany(() => Like, (like) => like.user, { onDelete: 'CASCADE' })
    likes: Like[];

    @OneToMany(() => Subscription, subs => subs.user, { onDelete: 'CASCADE' })
    subscriptions: Subscription[];

    @Column({ name: 'avatar_url', type: 'varchar', length: 255, nullable: true, default: null })
    avatarUrl: string | null;

    @Column({ name: 'description', type: 'varchar', nullable: true, default: 'Hello, I am a new user on this platform!' })
    description: string | null;

    // RELACIONES DE AMISTAD
    @Exclude()
    @OneToMany(() => Friendship, friendship => friendship.sender, { onDelete: 'CASCADE' })
    sentFriendships: Friendship[];

    @Exclude()
    @OneToMany(() => Friendship, friendship => friendship.receiver, { onDelete: 'CASCADE' })
    receivedFriendships: Friendship[];

    @OneToMany(() => Notification, notification => notification.receiver, { onDelete: 'CASCADE' })
    receivedNotifications: Notification[];

    @OneToMany(() => Notification, notification => notification.sender, { onDelete: 'CASCADE' })
    sentNotifications: Notification[];

    // Relación con rooms
    @OneToMany(() => Room, room => room.user1)
    roomsAsUser1: Room[];

    @OneToMany(() => Room, room => room.user2)
    roomsAsUser2: Room[];

    @OneToMany(() => Message, message => message.sender, { onDelete: 'CASCADE' })
    messages: Message[];

    @OneToMany(() => Message, message => message.receiver)
    receivedMessages: Message[];


    // Excluye campos sensibles al serializar
    toJSON() {
        const { password, verification_token, token_expiry, reset_password_token, reset_token_expiry, ...result } = this;
        return result;
    }
}
