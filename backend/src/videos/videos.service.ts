import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Channel } from '../channels/entities/channel.entity';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {}

  // Create a new video
  async create(createVideoDto: CreateVideoDto, channel: Channel) {
    const video = this.videoRepository.create({
      ...createVideoDto,
      channel,
    });
    return await this.videoRepository.save(video);
  }

  // Get all videos
  async findAll() {
    return this.videoRepository.find({
      relations: ['channel'],
      order: { createdAt: 'DESC' },
    });
  }

  // Update a video by its ID
  async update(id: string, updateVideoDto: UpdateVideoDto, channel: Channel) {
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['channel', 'channel.user'], //Cargar también el user del canal
    });
    if (!video) throw new NotFoundException('Video not found');

    if (video.channel.user.user_id !== channel.user.user_id) {
      throw new ForbiddenException('You cannot edit this video');
    }

    Object.assign(video, updateVideoDto);
    return await this.videoRepository.save(video);
  }

  // Delete a video by its ID
  async remove(id: string, channel: Channel) {
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['channel', 'channel.user'], //Cargar también el user del canal
    });
    if (!video) throw new NotFoundException('Video not found');

    if (video.channel.user.user_id !== channel.user.user_id) {
      throw new ForbiddenException('You cannot delete this video');
    }

    await this.videoRepository.remove(video);
    return { message: 'Video deleted successfully' };
  }
}