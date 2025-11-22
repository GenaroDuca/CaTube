import { ForbiddenException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Channel } from '../channels/entities/channel.entity';
import { UsersService } from 'src/users/users.service';
import { Tag } from 'src/tags/entities/tag.entity';

import { Readable } from 'stream'; // Debe importar Readable de 'stream'
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import * as ffprobeStatic from 'ffprobe-static';
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client } from 'src/aws/s3.config';
import { v4 as uuidv4 } from 'uuid';

// Configurar ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic as any);
ffmpeg.setFfprobePath(ffprobeStatic.path);

@Injectable()
export class VideosService {
  private readonly s3Client;

  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private userService: UsersService,

  ) {
    this.s3Client = getS3Client();

  }

  // ======================================================
  // CREATE VIDEO 
  // ======================================================
  async create(createVideoDto: CreateVideoDto, userId: string, files: Express.Multer.File[]) {
    const user = await this.userService.findOneById(userId);
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    const channel = user.channel;
    if (!channel) throw new NotFoundException(`Channel not found for user ${userId}`);

    if (!files || files.length === 0) throw new InternalServerErrorException('No files uploaded');

    // 1. Encontrar el archivo de video y obtener su duración (NUEVA LÓGICA)
    const videoFile = files.find(file => file.mimetype.startsWith('video/'));
    if (!videoFile) throw new InternalServerErrorException('Video file is required');

    let duration: number;
    try {
      // Usar el Buffer para obtener la duración, evitando el problema de la URL/S3
      duration = await this.getVideoDurationFromBuffer(videoFile.buffer);
    } catch (error) {
      console.error('FFPROBE Error (SIGSEGV likely):', error);
      throw new InternalServerErrorException('Failed to analyze video file (ffprobe failed).');
    }

    const newVideo = this.videoRepository.create({
      ...createVideoDto,
      channel,
      duration: duration,
      type: duration <= 60 ? 'short' : 'video'
    });

    // 2. Subir los archivos a S3
    for (const file of files) {
      const extension = file.originalname.split('.').pop();
      const key = `${uuidv4()}_${Date.now()}.${extension}`;

      try {
        const command = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        });

        await this.s3Client.send(command);
        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        if (file.mimetype.startsWith('image/')) newVideo.thumbnail = url;
        else if (file.mimetype.startsWith('video/')) newVideo.url = url;
      } catch (err) {
        console.error('S3 upload error:', err);
        throw new InternalServerErrorException('Failed to upload file to S3');
      }
    }

    // La URL del video ya está garantizada por la verificación inicial y la subida

    await this.videoRepository.save(newVideo);
    const link = newVideo.type === 'short' ? `/shorts/${newVideo.id}` : `/watch/${newVideo.id}`;
    return { ...newVideo, link };
  }

  // ======================================================
  // UPDATE VIDEO
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
      if (!thumbnailFile.mimetype.startsWith('image/'))
        throw new InternalServerErrorException('File must be an image');

      const extension = thumbnailFile.originalname.split('.').pop();
      const key = `${uuidv4()}_${Date.now()}.${extension}`;

      try {
        const command = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: key,
          Body: thumbnailFile.buffer,
          ContentType: thumbnailFile.mimetype,
        });

        await this.s3Client.send(command);
        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        updates.thumbnail = url;

        // borrar thumbnail anterior
        if (video.thumbnail) {
          const oldKey = video.thumbnail.split('/').pop();
          await this.s3Client.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME!, Key: oldKey }));
        }

      } catch (err) {
        console.log(process.env.AWS_ACCESS_KEY_ID);
        console.log(process.env.AWS_SECRET_ACCESS_KEY);
        console.error('S3 upload error3:', err);
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

private async getVideoDurationFromBuffer(buffer: Buffer): Promise < number > {
  return new Promise((resolve, reject) => {
    // 1. Crear un Readable Stream a partir del Buffer
    const stream = Readable.from(buffer);

    // 2. Usar el stream como input
    const command = ffmpeg(stream)
      .inputFormat('mp4'); // Opcional

    command.ffprobe((err, metadata) => {
      if (err) {
        return reject(new InternalServerErrorException('ffprobe failed to analyze stream.'));
      }
      resolve(metadata.format.duration || 0);
    });
    // El stream se cerrará automáticamente, por lo que no necesita .end()
  });
}

  // ======================================================
  // TODOS LOS MÉTODOS ORIGINALES SE MANTIENEN
  // ======================================================
  async incrementViews(id: string): Promise < void> {
  const video = await this.videoRepository.findOne({ where: { id } });
  if(!video) throw new NotFoundException("Video not found");
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

  // ======================================================
  // DELETE VIDEO
  // ======================================================
  async remove(id: string, channel: Channel) {
  const video = await this.videoRepository.findOne({
    where: { id },
    relations: ['channel', 'channel.user'],
  });
  if (!video) throw new NotFoundException('Video not found');

  if (video.channel.channel_id !== channel.channel_id) {
    throw new ForbiddenException('You cannot delete this video');
  }

  await this.videoRepository.remove(video);
  return { message: 'Video deleted successfully' };
}
}
