import { Column, Entity, ManyToOne, Unique, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Video } from 'src/videos/entities/video.entity';
import { Comment } from 'src/comments/entities/comment.entity';


@Entity()
@Unique(['user', 'video', 'comment'])
export class Like {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    like: boolean; 

    @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Video, (video) => video.likes, {
        onDelete: 'CASCADE',
        nullable: true
    })
    video: Video | null;

    @ManyToOne(() => Comment, (comment) => comment.likes, {
        onDelete: 'CASCADE',
        nullable: true
    })
    comment: Comment | null;

    @CreateDateColumn()
    createdAt: Date;
}