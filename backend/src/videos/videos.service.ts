import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Channel } from '../channels/entities/channel.entity';
import { UsersService } from 'src/users/users.service';
import { Tag } from 'src/tags/entities/tag.entity';

import * as path from 'path';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import * as ffprobeStatic from 'ffprobe-static';
import { getUploadsPath } from 'src/utils/uploads-path';

// Set the path to ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegStatic as any);
ffmpeg.setFfprobePath(ffprobeStatic.path);

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private userService: UsersService,
  ) { }

  // ======================================================
  // CREATE VIDEO
  // ======================================================
  async create(
    createVideoDto: CreateVideoDto,
    userId: string,
    files: Express.Multer.File[]
  ) {
    try {
      const user = await this.userService.findOneById(userId);
      if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

      const channel = user.channel;
      if (!channel) throw new NotFoundException(`Channel not found for user ${userId}`);

      const newVideo = this.videoRepository.create({
        ...createVideoDto,
        channel,
      });

      const uploadDir = getUploadsPath('videos');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      if (!files || files.length === 0) throw new Error('No files were uploaded');

      for (const file of files) {
        const videoId = newVideo.id ?? Date.now().toString();
        const safeName = file.originalname.replace(/\s+/g, '_');
        const fileName = `${videoId}_${Date.now()}_${safeName}`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, file.buffer);
        const relativePath = `/uploads/videos/${fileName}`;

        if (file.mimetype.startsWith('image/')) newVideo.thumbnail = relativePath;
        else if (file.mimetype.startsWith('video/')) newVideo.url = relativePath;
      }

      if (!newVideo.url) throw new Error('Video file is required but was not uploaded.');

      const videoPath = path.join(process.cwd(), newVideo.url);
      const duration = await this.getVideoDuration(videoPath);
      newVideo.type = duration <= 60 ? 'short' : 'video';

      await this.videoRepository.save(newVideo);

      const link = newVideo.type === 'short' ? `/shorts/${newVideo.id}` : `/watch/${newVideo.id}`;

      return {
        ...newVideo,
        link,
      };
    } catch (err) {
      console.error('Error creating video:', err);
      throw new Error(`Failed to create video: ${err.message}`);
    }
  }
  
  // ======================================================
  // Visitas incrementales
  // ======================================================
  async incrementViews(id: string): Promise<void> {
    const video = await this.videoRepository.findOne({ where: { id } });
    if (!video) {
      throw new NotFoundException("Video not found");
    }
    video.views += 1;
    await this.videoRepository.save(video);
  }

  // ======================================================
  // GET VIDEOS
  // ======================================================
  async findAll() {
    return this.videoRepository.find({
      relations: ['channel', 'tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllShorts() {
    return this.videoRepository.find({
      where: { type: 'short' },
      relations: ['channel', 'tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllVideosOnly() {
    return this.videoRepository.find({
      where: { type: 'video' },
      relations: ['channel', 'tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByChannelId(channelId: string) {
    return this.videoRepository.find({
      where: { channel: { channel_id: channelId } },
      relations: ['channel', 'tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async findEducationalVideos() {
    return this.videoRepository
      .createQueryBuilder('video')
      .leftJoinAndSelect('video.channel', 'channel')
      .leftJoinAndSelect('channel.user', 'user')
      .leftJoinAndSelect('video.tags', 'tag')
      .where('tag.name = :tagName', { tagName: 'education' }) // filtra por tag educativo
      .orderBy('video.createdAt', 'DESC')
      .getMany();
  }

  async findAllByChannel(userId: string) {
    const user = await this.userService.findOneById(userId);
    if (!user) throw new NotFoundException(`User with ${userId} not found`);

    const channel = user.channel;
    if (!channel) throw new NotFoundException(`Channel not found for user ${userId}`);

    return this.videoRepository.find({
      where: { channel: { channel_id: channel.channel_id } },
      relations: ['channel', 'tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async getVideosByTag(tag: string) {
    const videos = await this.videoRepository.find({
      where: {
        tags: {
          name: tag
        }
      },
      relations: ['tags']
    });

    return videos;
  }

  // ======================================================
  // FIND ONE VIDEO
  // ======================================================
  async findOneById(id: string) {
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['channel', 'channel.user', 'tags'],
    });

    if (!video) throw new NotFoundException('Video not found');

    if (!video.channel || !video.channel.user) {
      console.error('Video found but missing channel or user information:', {
        videoId: video.id,
        hasChannel: !!video.channel,
        hasUser: !!video.channel?.user
      });
      throw new ForbiddenException('Video no tiene información de canal o usuario asociada');
    }

    return video;
  }

  // ======================================================
  // UPDATE VIDEO
  // ======================================================
  async update(id: string, updateVideoDto: UpdateVideoDto, files?: Express.Multer.File[]) {
    try {
      const video = await this.videoRepository.findOne({
        where: { id },
        relations: ['channel', 'channel.user', 'tags'],
      });

      if (!video) throw new NotFoundException('Video not found');

      const updates: any = {};
      if (updateVideoDto.title !== undefined) updates.title = updateVideoDto.title;
      if (updateVideoDto.description !== undefined) updates.description = updateVideoDto.description;

      if (files && files.length > 0) {
        const thumbnailFile = files[0];
        if (!thumbnailFile.mimetype.startsWith('image/')) throw new Error('El archivo debe ser una imagen');

        const uploadDir = getUploadsPath('videos');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const safeName = thumbnailFile.originalname.replace(/\s+/g, '_');
        const fileName = `${video.id}_${Date.now()}_${safeName}`;
        const filePath = path.join(uploadDir, fileName);

        await fs.promises.writeFile(filePath, thumbnailFile.buffer);
        updates.thumbnail = `/uploads/videos/${fileName}`;

        if (video.thumbnail) {
          const oldThumbnailPath = path.join(process.cwd(), video.thumbnail.replace(/^\//, ''));
          if (fs.existsSync(oldThumbnailPath)) await fs.promises.unlink(oldThumbnailPath);
        }
      }

      if (Object.keys(updates).length === 0) throw new Error('No se proporcionaron cambios para actualizar');

      Object.assign(video, updates);
      const updatedVideo = await this.videoRepository.save(video);

      return {
        id: updatedVideo.id,
        title: updatedVideo.title,
        description: updatedVideo.description,
        thumbnail: updatedVideo.thumbnail,
        url: updatedVideo.url,
        tags: updatedVideo.tags
      };
    } catch (error) {
      console.error('Error in video update:', error);
      throw error;
    }
  }

  // ======================================================
  // DELETE VIDEO
  // ======================================================
  async remove(id: string, channel: Channel) {
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['channel', 'channel.user'],
    });
    if (!video) throw new NotFoundException('Video not found');

    if (video.channel.user.user_id !== channel.user.user_id) {
      throw new ForbiddenException('You cannot delete this video');
    }

    await this.videoRepository.remove(video);
    return { message: 'Video deleted successfully' };
  }

  // ======================================================
  // HELPERS
  // ======================================================
  private async getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          console.error('Error getting video duration:', err);
          reject(err);
        } else {
          resolve(metadata.format.duration || 0);
        }
      });
    });
  }
}
