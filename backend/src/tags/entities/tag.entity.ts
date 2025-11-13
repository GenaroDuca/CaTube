import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Video } from '../../videos/entities/video.entity';
export enum TagType {
  PREDEFINED = 'predefined',
  CUSTOM = 'custom',
}

@Entity()
export class Tag {
  @PrimaryGeneratedColumn("uuid")
  tag_id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: TagType, default: TagType.CUSTOM })
  type: TagType;

  @Column({ default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Video, (video) => video.tags)
  videos: Video[];
}