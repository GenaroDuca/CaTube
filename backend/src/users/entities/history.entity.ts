import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Video } from '../../videos/entities/video.entity';

@Entity('history')
@Unique(['user', 'video'])
export class History {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Video, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'video_id' })
    video: Video;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    viewedAt: Date;
}
