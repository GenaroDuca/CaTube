import { Column, JoinColumn, OneToOne, Entity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { User } from "src/users/entities/user.entity";

@Entity('channels')
export class Channel {
    @PrimaryGeneratedColumn()
    channel_id: number;

    @CreateDateColumn() 
    channel_date: Date;

    @Column()
    channel_name: string;

    @Column({ nullable: true }) 
    description: string;

    @Column({ unique: true }) 
    url: string;

    @OneToOne(() => User, (user) => user.channel)

    @JoinColumn({ name: 'usuario_id' })

    user: User;
}