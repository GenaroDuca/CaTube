import {
  Column,
  JoinColumn,
  OneToOne,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Store } from "src/store/entities/store.entity";
import { Subscription } from "src/subs/entities/sub.entity";
import { Video } from "src/videos/entities/video.entity";
import { Post } from "src/posts/entities/post.entity";

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  channel_id: string;

  @CreateDateColumn()
  channel_date: Date;

  @Column()
  channel_name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ unique: true })
  url: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ nullable: true })
  bannerUrl: string;

  @Column({ default: 0 })
  subscriberCount: number;

  // Relación 1:1 con User con restricción de unicidad
  @OneToOne(() => User, user => user.channel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Store, store => store.channel)
  store: Store;

  @OneToMany(() => Subscription, subs => subs.channel)
  subscribers: Subscription[];

  @OneToMany(() => Video, video => video.channel, { onDelete: 'CASCADE' })
  videos: Video[];

  @OneToMany(() => Post, post => post.channel, { onDelete: 'CASCADE' })
  posts: Post[];
}