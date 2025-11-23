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
  // CREATE VIDEO (COMPLETAMENTE CORREGIDO Y ROBUSTO)
  // ======================================================
  async create(createVideoDto: CreateVideoDto, userId: string, files: Express.Multer.File[]) {
    try {
      console.log('LOG: Iniciando proceso de creación para usuario ID:', userId);

      // 1. Validar Usuario y Canal
      const user = await this.userService.findOneById(userId);
      if (!user) {
        console.warn(`WARN: Usuario ID ${userId} no encontrado.`);
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      const channel = user.channel;
      if (!channel) {
        console.warn(`WARN: Canal no encontrado para usuario ID ${userId}.`);
        throw new NotFoundException(`Channel not found for user ${userId}`);
      }

      if (!files || files.length === 0) {
        console.error('ERROR: No se subieron archivos.');
        throw new InternalServerErrorException('No files uploaded');
      }

      // 2. Encontrar archivo de video y obtener su duración
      const videoFile = files.find(file => file.mimetype.startsWith('video/'));
      if (!videoFile) {
        console.error('ERROR: Archivo de video requerido no encontrado.');
        throw new InternalServerErrorException('Video file is required');
      }

      let duration: number;
      try {
        // Intenta obtener la duración
        duration = await this.getVideoDurationFromBuffer(videoFile.buffer, videoFile.mimetype);
        console.log(`LOG: Duración detectada para el video: ${duration} segundos.`);
      } catch (error) {
        console.error('ERROR: FFPROBE falló (SIGSEGV/timeout probable). Usando duración de fallback.', error);
        // Si FFPROBE falla, usamos 61 segundos para forzar la clasificación como 'video'
        duration = 61;
      }

      // 3. Crear Entidad Video
      // Aseguramos que si la duración detectada es 0 (ej. archivo corrupto), usamos 61 para evitar ser un 'short'
      if (duration === 0) duration = 61;

      const type = duration <= 60 ? 'short' : 'video';
      console.log(`LOG: El video se clasificará como: ${type}.`);

      const newVideo = this.videoRepository.create({
        ...createVideoDto,
        channel,
        duration: duration,
        type: type, // Clasificación corregida
      });

      // 4. Subir archivos a S3
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

          if (file.mimetype.startsWith('image/')) {
            newVideo.thumbnail = url;
            console.log('LOG: Thumbnail subido y URL guardada.');
          } else if (file.mimetype.startsWith('video/')) {
            newVideo.url = url;
            console.log('LOG: Video subido y URL guardada.');
          }
        } catch (err) {
          console.error('ERROR FATAL: Fallo al subir archivo a S3.', err);
          // Lanza una excepción HTTP para que NestJS la capture
          throw new InternalServerErrorException('Failed to upload file to S3');
        }
      }

      // 5. Guardar en Base de Datos
      await this.videoRepository.save(newVideo);
      console.log(`LOG: Video ID ${newVideo.id} guardado exitosamente en DB.`);

      const link = newVideo.type === 'short' ? `/shorts/${newVideo.id}` : `/watch/${newVideo.id}`;
      return { ...newVideo, link };

    } catch (error) {
      // Este bloque garantiza que CUALQUIER error se propague como una Excepción HTTP
      console.error('ERROR: Fallo catastrófico en VideosService.create.', error);

      // Si ya es una excepción HTTP controlada (NotFoundException, etc.), la relanzamos.
      if (error.status) {
        throw error;
      }
      // Si es una excepción no controlada (ej. error de TypeORM, u otra excepción de Node.js), la transformamos.
      throw new InternalServerErrorException('An unexpected error occurred during video creation.');
    }
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

  private async getVideoDurationFromBuffer(buffer: Buffer, mimetype: string): Promise<number> {
    return new Promise((resolve, reject) => {
      // 1. Crear un Readable Stream a partir del Buffer
      const stream = Readable.from(buffer);

      // Determinar formato basado en mimetype
      let format = 'mp4'; // default
      if (mimetype.includes('webm')) format = 'webm';
      else if (mimetype.includes('matroska') || mimetype.includes('mkv')) format = 'matroska';
      else if (mimetype.includes('quicktime') || mimetype.includes('mov')) format = 'mov';
      else if (mimetype.includes('avi')) format = 'avi';

      // 2. Usar el stream como input
      const command = ffmpeg(stream)
        .inputFormat(format);

      command.ffprobe((err, metadata) => {
        if (err) {
          console.error('FFprobe error:', err);
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

  // ======================================================
  // DELETE VIDEO
  // ======================================================
  async remove(id: string, userId: string) {
    const user = await this.userService.findOneById(userId);
    if (!user || !user.channel) throw new NotFoundException('User or Channel not found');

    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['channel', 'channel.user'],
    });
    if (!video) throw new NotFoundException('Video not found');

    if (video.channel.channel_id !== user.channel.channel_id) {
      throw new ForbiddenException('You cannot delete this video');
    }

    await this.videoRepository.remove(video);
    return { message: 'Video deleted successfully' };
  }
}
