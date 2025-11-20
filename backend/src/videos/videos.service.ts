import { ForbiddenException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Channel } from '../channels/entities/channel.entity';
import { UsersService } from 'src/users/users.service';
import { Tag } from 'src/tags/entities/tag.entity';

import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import * as ffprobeStatic from 'ffprobe-static';
import { s3 } from 'src/aws/s3.config';
import { v4 as uuidv4 } from 'uuid';

// Configurar ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic as any);
ffmpeg.setFfprobePath(ffprobeStatic.path);

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private userService: UsersService,
  ) {}

  // ======================================================
  // CREATE VIDEO -> ahora con S3
  // ======================================================
  async create(createVideoDto: CreateVideoDto, userId: string, files: Express.Multer.File[]) {
    const user = await this.userService.findOneById(userId);
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    const channel = user.channel;
    if (!channel) throw new NotFoundException(`Channel not found for user ${userId}`);

    if (!files || files.length === 0) throw new InternalServerErrorException('No files uploaded');

    const newVideo = this.videoRepository.create({
      ...createVideoDto,
      channel,
    });

    // Subir archivos a S3
    for (const file of files) {
      const extension = file.originalname.split('.').pop();
      const key = `${uuidv4()}_${Date.now()}.${extension}`;

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      try {
        const result = await s3.upload(params).promise();
        const url = result.Location;

        if (file.mimetype.startsWith('image/')) newVideo.thumbnail = url;
        else if (file.mimetype.startsWith('video/')) newVideo.url = url;
      } catch (err) {
        console.error('S3 upload error:', err);
        throw new InternalServerErrorException('Failed to upload file to S3');
      }
    }

    if (!newVideo.url) throw new InternalServerErrorException('Video file is required');

    // Determinar tipo short o video
    const duration = await this.getVideoDurationFromUrl(newVideo.url);
    newVideo.type = duration <= 60 ? 'short' : 'video';

    await this.videoRepository.save(newVideo);

    const link = newVideo.type === 'short' ? `/shorts/${newVideo.id}` : `/watch/${newVideo.id}`;
    return { ...newVideo, link };
  }

  // ======================================================
  // UPDATE VIDEO -> actualizar thumbnail a S3
  // ======================================================
  async update(id: string, updateVideoDto: UpdateVideoDto, files?: Express.Multer.File[]) {
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
      if (!thumbnailFile.mimetype.startsWith('image/')) throw new InternalServerErrorException('File must be an image');

      const extension = thumbnailFile.originalname.split('.').pop();
      const key = `${uuidv4()}_${Date.now()}.${extension}`;

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: thumbnailFile.buffer,
        ContentType: thumbnailFile.mimetype,
        ACL: 'public-read',
      };

      try {
        const result = await s3.upload(params).promise();
        const url = result.Location;
        updates.thumbnail = url;

        // Si había thumbnail anterior, opcionalmente se puede borrar de S3
        // const oldKey = video.thumbnail.split('/').pop();
        // await s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME!, Key: oldKey }).promise();

      } catch (err) {
        console.error('S3 upload error:', err);
        throw new InternalServerErrorException('Failed to upload thumbnail to S3');
      }
    }

    Object.assign(video, updates);
    const updatedVideo = await this.videoRepository.save(video);

    return {
      id: updatedVideo.id,
      title: updatedVideo.title,
      description: updatedVideo.description,
      thumbnail: updatedVideo.thumbnail,
      url: updatedVideo.url,
      tags: updatedVideo.tags,
    };
  }

  // ======================================================
  // Helper: obtener duración del video desde URL S3
  // ======================================================
  private async getVideoDurationFromUrl(url: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(url, (err, metadata) => {
        if (err) return reject(err);
        resolve(metadata.format.duration || 0);
      });
    });
  }

  // ======================================================
  // TODOS LOS MÉTODOS ORIGINALES SE MANTIENEN
  // ======================================================
  async incrementViews(id: string): Promise<void> {
    const video = await this.videoRepository.findOne({ where: { id } });
    if (!video) throw new NotFoundException("Video not found");
    video.views += 1;
    await this.videoRepository.save(video);
  }

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
      .where('tag.name = :tagName', { tagName: 'education' })
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
    return this.videoRepository.find({
      where: { tags: { name: tag } },
      relations: ['tags'],
    });
  }

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
        hasUser: !!video.channel?.user,
      });
      throw new ForbiddenException('Video no tiene información de canal o usuario asociada');
    }

    return video;
  }

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
}
