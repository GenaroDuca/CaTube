import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { Channel } from '../../channels/entities/channel.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Tag } from '../../tags/entities/tag.entity';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ default: 'Public' })
  visibility: string;

  @Column({ default: 'None' })
  restrictions: string;

  @Column()
  url: string;

  @Column({ default: 0 })
  views: number;

  // COLUMNA AÑADIDA PARA SOLUCIONAR EL ERROR DE 'DURATION'
  @Column({ type: 'float', default: 0 })
  duration: number;

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

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Tag, (tag) => tag.videos, { cascade: true, onDelete: 'CASCADE' })
  @JoinTable()
  tags: Tag[];
}