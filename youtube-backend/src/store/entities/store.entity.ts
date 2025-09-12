import { Channel } from "src/channels/channel.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Store {
    @PrimaryGeneratedColumn()
    store_id: number;

    @Column()
    store_name: string;

    @Column({ nullable: true })
    description: string;

    @OneToOne(() => Channel, (channel) => channel.store)
    @JoinColumn({ name: 'channel_id' }) //clave foránea
    channel: Channel;
}
