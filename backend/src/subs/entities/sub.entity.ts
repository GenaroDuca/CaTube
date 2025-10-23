import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Channel } from '../../channels/entities/channel.entity';

@Entity()
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.subscriptions) 
    user: User;

    @ManyToOne(() => Channel, channel => channel.subscribers)
    channel: Channel;

    @CreateDateColumn()
    createdAt: Date;
}

