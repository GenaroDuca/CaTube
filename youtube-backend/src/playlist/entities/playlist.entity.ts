import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { User } from "../../users/user.entity";
import { Channel } from "../../channels/channel.entity";
import { channel } from "diagnostics_channel";

@Entity()
export class Playlist {
    @PrimaryGeneratedColumn("uuid")
    playlist_id: string;

    @Column()
    playlist_title: string;

    @Column({ nullable: true })
    playlist_description: string;

    @Column({ default: false })
    isPublic: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, user => user.playlists)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Channel, (channel) => channel.playlists) //muchas playlists pueden pertenecer a un canal
    @JoinColumn({ name: 'channel_id' }) //clave foránea
    channel: Channel;

}
