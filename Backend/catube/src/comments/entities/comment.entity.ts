import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Video } from 'src/videos/entities/video.entity';
import { Like } from 'src/likes/entities/like.entity';

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    content: string;

    @Column()
    videoId: string;

    @Column()
    userId: string;

    @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
    user: User;

    //nullable: true to like comments or videos independently
    @ManyToOne(() => Video, (video) => video.comments, { onDelete: 'CASCADE', nullable: true }) //OnDelete: 'CASCADE' for deleting comments if video is deleted
    video: Video;

    @OneToMany(() => Like, (like) => like.comment, { onDelete: 'CASCADE', nullable: true })
    likes: Like[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
