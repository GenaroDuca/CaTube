import { Column, JoinColumn, OneToOne, Entity, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from "typeorm";
import { User } from "src/users/user.entity";
import { Store } from "src/store/entities/store.entity";

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

    @OneToOne(() => Store, (store) => store.channel)
    store: Store;
}