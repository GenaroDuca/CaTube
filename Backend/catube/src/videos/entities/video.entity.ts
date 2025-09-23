import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';

@Entity('videos')
export class Video {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column( { nullable: true } ) // Making description nullable to allow empty descriptions
    description: string;

    @Column('simple-array', { nullable: true }) // Storing tags as a simple array, allowing null values
    tags: string[];

    @Column()
    url: string;

    @Column({ default: 0 })
    views: number;

    @ManyToOne(() => User, (user) => user.videos, { onDelete: 'CASCADE' }) //OnDelete: 'CASCADE' for deleting videos if user is deleted
    user: User;

    @OneToMany(() => Comment, (comment) => comment.video)
    comments: Comment[];

    @OneToMany(() => Like, (like) => like.video, { onDelete: 'CASCADE' }) 
    likes: Like[];

    //UNIR CON MEDIA DE GENA

    // @OneToOne(() => Media, {aeger: true, onDelete: 'CASCADE'})
    // @JoinColumn()
    // thumbnail: Media;

    @CreateDateColumn()
    createdAt: Date;
}
