import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToOne, OneToMany} from 'typeorm';
import { Channel } from 'src/channels//entities/channel.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Video } from 'src/videos/entities/video.entity';
import { Like } from 'src/likes/entities/like.entity';


@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
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

    @OneToMany(() => Comment, (comment) => comment.user, { onDelete: 'CASCADE' })
    comments: Comment[];

    @OneToMany(() => Video, (video) => video.user, { onDelete: 'CASCADE' })
    videos: Video[];

    @OneToMany(() => Like, (like) => like.user, { onDelete: 'CASCADE' }) 
    likes: Like[];
}