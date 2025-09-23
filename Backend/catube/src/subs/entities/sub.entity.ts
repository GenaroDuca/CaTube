import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Channel } from 'src/channels/entities/channel.entity';

@Entity()
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.subscriptions, { eager: true }) //
    user: User;

    @ManyToOne(() => Channel, channel => channel.subscribers, { eager: true })
    channel: Channel;

    @CreateDateColumn()
    createdAt: Date;
}

