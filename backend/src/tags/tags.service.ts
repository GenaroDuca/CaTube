import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag, TagType } from './entities/tag.entity';
import { Repository } from 'typeorm';
import { Video } from '../videos/entities/video.entity';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag) private tagRepo: Repository<Tag>,
    @InjectRepository(Video) private videoRepo: Repository<Video>,
  ) {}

  async createTag(dto: CreateTagDto) {
    const existing = await this.tagRepo.findOne({ where: { name: dto.name } });
    if (existing) return existing;

    const tag = this.tagRepo.create(dto);
    return this.tagRepo.save(tag);
  }

  async getAllTags() {
    return this.tagRepo.find();
  }

  async assignTagsToVideo(videoId: string, tagNames: string[]) {
    const video = await this.videoRepo.findOne({
      where: { id: videoId },
      relations: ['tags'],
    });
    if (!video) throw new Error('Video not found');

    const tags = await Promise.all(
      tagNames.map(async (name) => {
        let tag = await this.tagRepo.findOne({ where: { name } });
        if (!tag) {
          tag = this.tagRepo.create({ name, type: TagType.CUSTOM });
          await this.tagRepo.save(tag);
        }
        return tag;
      }),
    );

    video.tags = [...new Set([...video.tags, ...tags])];
    return this.videoRepo.save(video);
  }
}