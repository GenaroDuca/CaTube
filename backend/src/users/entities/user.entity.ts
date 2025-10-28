import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, Unique } from 'typeorm';
import { Channel } from 'src/channels/entities/channel.entity';
import { Playlist } from 'src/playlist/entities/playlist.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Subscription } from 'src/subs/entities/sub.entity';
import { Friendship } from 'src/friendships/entities/friendship.entity';
import { Exclude } from 'class-transformer';


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

    // --- CAMPOS AGREGADOS PARA LA VERIFICACIÓN DE EMAIL ---

    @Column({ name: 'is_verified', default: false })
    is_verified: boolean;

    @Column({
        name: 'verification_token',
        nullable: true,
        unique: true,
        type: 'varchar',
        length: 255
    })

    verification_token: string | null;

    @Column({ name: 'token_expiry', type: 'timestamp', nullable: true })
    token_expiry: Date | null;

    // -------------------------------------------------------

    @OneToOne(() => Channel, (channel) => channel.user)
    channel: Channel;

    // Este método se llama automáticamente cuando se serializa el objeto a JSON.
    // Excluye la contraseña del objeto resultante.
    toJSON() {
        const { password, verification_token, token_expiry, ...result } = this;
        // También excluimos el token y su caducidad por seguridad
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

    @Column({
        name: 'avatar_url',
        type: 'varchar', 
        length: 255,
        nullable: true,
        default: null
    })
    avatarUrl: string | null;

    @Column({
        name: 'description',
        type: 'varchar', 
        nullable: true,
        default: 'Hello, I am a new user on this platform!' 
    })
    description: string | null;

    // RELACIONES DE AMISTAD
    @Exclude() // 💡 SOLUCIÓN: Excluye esta propiedad de la serialización
    @OneToMany(() => Friendship, friendship => friendship.sender)
    sentFriendships: Friendship[];

    @Exclude() // 💡 SOLUCIÓN: Excluye esta propiedad de la serialización
    @OneToMany(() => Friendship, friendship => friendship.receiver)
    receivedFriendships: Friendship[];
}