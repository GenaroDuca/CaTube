import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Channel } from 'src/channels/channel.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    user_id: number;

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

    @OneToOne(() => Channel, (channel) => channel.user)
    channel: Channel;
}
