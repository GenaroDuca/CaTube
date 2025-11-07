import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { Channel } from '../../channels/entities/channel.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';
import { PlaylistVideo } from '../../playlist_videos/entities/playlist_video.entity';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true})
  thumbnail: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ default: 'Public' })
  visibility: string;

  @Column({ default: 'None' })
  restrictions: string;

  @Column()
  url: string;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 'video' })
  type: string; // 'video' or 'short'

  //Relación con canal
  @ManyToOne(() => Channel, channel => channel.videos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  //Comentarios
  @OneToMany(() => Comment, comment => comment.video)
  comments: Comment[];

  //Likes
  @OneToMany(() => Like, like => like.video, { onDelete: 'CASCADE' })
  likes: Like[];

  //Relación con playlists (intermedia)
  @OneToMany(() => PlaylistVideo, playlistVideo => playlistVideo.video)
  playlistVideos: PlaylistVideo[];

  @CreateDateColumn()
  createdAt: Date;
}