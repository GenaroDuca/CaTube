import {
    Column,
    JoinColumn,
    OneToOne,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Store } from "src/store/entities/store.entity";
import { Playlist } from "src/playlist/entities/playlist.entity";
import { Subscription } from "src/subs/entities/sub.entity";
import { Video } from "src/videos/entities/video.entity";

@Entity('channels')
export class Channel {
    @PrimaryGeneratedColumn('uuid')
    channel_id: string;

    @CreateDateColumn()
    channel_date: Date;

    @Column()
    channel_name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ unique: true })
    url: string;

    @Column({ nullable: true })
    photoUrl: string;

    @Column({ default: 0 })
    subscriberCount: number;

      // Relación 1:1 con User con restricción de unicidad
    @OneToOne(() => User, user => user.channel, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    //   @Column({ unique: true }) // Esto asegura que no haya dos canales con el mismo user_id --> da error XD xq no se puede usar Column en relaciones
    user: User;

    @OneToOne(() => Store, store => store.channel)
    store: Store;

    @OneToMany(() => Playlist, playlist => playlist.channel)
    playlists: Playlist[];

    @OneToMany(() => Subscription, subs => subs.channel)
    subscribers: Subscription[];

    @OneToMany(() => Video, video => video.channel, { onDelete: 'CASCADE' })
    videos: Video[];
}