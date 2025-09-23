import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToMany } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Channel } from "../../channels/entities/channel.entity";
import { PlaylistVideo } from '../../playlist_videos/entities/playlist_video.entity';

@Entity()
export class Playlist {
  @PrimaryGeneratedColumn("uuid")
  playlist_id: string;

  @Column()
  playlist_title: string;

  @Column({ nullable: true })
  playlist_description: string;

  @Column({ default: false })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.playlists)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Channel, channel => channel.playlists)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @OneToMany(() => PlaylistVideo, playlistVideo => playlistVideo.playlist)
  playlistVideos: PlaylistVideo[];
}
