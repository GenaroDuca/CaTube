import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Video } from 'src/videos/entities/video.entity';
import { Like } from 'src/likes/entities/like.entity';

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: "longtext" })
    content: string;

    @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Video, (video) => video.comments, { onDelete: 'CASCADE' }) //OnDelete: 'CASCADE' for deleting comments if video is deleted
    @JoinColumn({ name: 'videoId' })
    video: Video;

    @OneToMany(() => Like, (like) => like.comment, { onDelete: 'CASCADE' })
    likes: Like[];

    @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parentCommentId' })
    parentComment?: Comment;

    @OneToMany(() => Comment, (comment) => comment.parentComment)
    replies: Comment[];


    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
