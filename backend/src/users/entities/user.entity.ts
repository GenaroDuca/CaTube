import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, Unique } from 'typeorm';
import { Channel } from 'src/channels/entities/channel.entity';
import { Playlist } from 'src/playlist/entities/playlist.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Subscription } from 'src/subs/entities/sub.entity';

@Unique(['username']) // Asegura que el username sea único a nivel de BD
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

    @OneToOne(() => Channel, (channel) => channel.user)
    channel: Channel;

    // Este método se llama automáticamente cuando se serializa el objeto a JSON.
    // Excluye la contraseña del objeto resultante.
    toJSON() {
        const { password, ...result } = this;
        return result;
    }

    @OneToMany(() => Playlist, (playlist) => playlist.user)
    playlists: Playlist[];

    @OneToMany(() => Comment, (comment) => comment.user, { onDelete: 'CASCADE' })
    comments: Comment[];

    @OneToMany(() => Like, (like) => like.user, { onDelete: 'CASCADE' })
    likes: Like[];

    @OneToMany(() => Subscription, subs => subs.user)
    subscriptions: Subscription[];
}