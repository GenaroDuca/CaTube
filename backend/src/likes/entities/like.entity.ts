import { IsUUID } from 'class-validator';
import { Column, Entity, ManyToOne, Unique, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Video } from 'src/videos/entities/video.entity';
import { Comment } from 'src/comments/entities/comment.entity';

@Entity()
@Unique(['user', 'video', 'comment']) // A user can like/dislike a video or comment only once
export class Like {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    like: boolean; // true for like, false for dislike

    @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' }) // When a user is deleted, delete their likes as well
    user: User;

    @ManyToOne(() => Video, (video) => video.likes, { onDelete: 'CASCADE', nullable: true })
    video?: Video;

    @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: 'CASCADE', nullable: true }) 
    comment?: Comment;
}
