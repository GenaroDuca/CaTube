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
  // CREATE VIDEO (JOB INITIATION)
  // ======================================================
  async create(createVideoDto: CreateVideoDto, userId: string) {
    const user = await this.userService.findOneById(userId);
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    const channel = user.channel;
    if (!channel) throw new NotFoundException(`Channel not found for user ${userId}`);

    // Create initial video record
    const newVideo = this.videoRepository.create({
      ...createVideoDto,
      channel,
      status: 'processing',
      processingProgress: 0,
      url: '', // Placeholder
      thumbnail: '', // Placeholder
      duration: 0,
      type: 'video' // Default
    });

    await this.videoRepository.save(newVideo);
    console.log(`LOG: Job creado para video ID ${newVideo.id}`);

    return newVideo;
  }

  // ======================================================
  // PROCESS VIDEO (BACKGROUND TASK)
  // ======================================================
  async processVideo(videoId: string, files: Express.Multer.File[]) {
    console.log(`LOG: Iniciando procesamiento de fondo para video ${videoId}`);
    try {
      const video = await this.videoRepository.findOne({ where: { id: videoId } });
      if (!video) {
        console.error(`ERROR: Video ${videoId} no encontrado para procesar.`);
        return;
      }

      // 10% - Iniciado
      video.processingProgress = 10;
      await this.videoRepository.save(video);

      const videoFile = files.find(file => file.mimetype.startsWith('video/'));
      if (!videoFile) {
        throw new Error('No video file found');
      }

      // 30% - Analizando duración
      let duration = 61;
      try {
        console.log(`🎬 Analizando duración del video ${videoId}...`);
        duration = await this.getVideoDurationFromBuffer(videoFile.buffer, videoFile.mimetype);
        console.log(`⏱️  Duración detectada: ${duration} segundos`);
      } catch (error) {
        console.error('FFPROBE error, using fallback duration', error);
        console.log(`⚠️  Usando duración por defecto: ${duration} segundos`);
      }

      video.duration = duration === 0 ? 61 : duration;
      video.type = video.duration <= 60 ? 'short' : 'video';
      
      console.log(`📊 Clasificación del video ${videoId}: ${video.title}`);
      console.log(`   - Duración final: ${video.duration} segundos`);
      console.log(`   - Tipo asignado: ${video.type}`);
      console.log(`   - Es Short: ${video.duration <= 60 ? 'SÍ ✅' : 'NO ❌'}`);
      
      video.processingProgress = 30;
      await this.videoRepository.save(video);

      // 70% - Subiendo Video a S3
      const videoExtension = videoFile.originalname.split('.').pop();
      const videoKey = `videos/${uuidv4()}_${Date.now()}.${videoExtension}`;

      const videoCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: videoKey,
        Body: videoFile.buffer,
        ContentType: videoFile.mimetype,
      });

      await this.s3Client.send(videoCommand);
      video.url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${videoKey}`;

      video.processingProgress = 70;
      await this.videoRepository.save(video);

      // 90% - Subiendo Thumbnail (si existe)
      const thumbnailFile = files.find(file => file.mimetype.startsWith('image/'));
      if (thumbnailFile) {
        const thumbExtension = thumbnailFile.originalname.split('.').pop();
        const thumbKey = `thumbnails/${uuidv4()}_${Date.now()}.${thumbExtension}`;

        const thumbCommand = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: thumbKey,
          Body: thumbnailFile.buffer,
          ContentType: thumbnailFile.mimetype,
        });

        await this.s3Client.send(thumbCommand);
        video.thumbnail = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbKey}`;
      }

      video.processingProgress = 90;
      await this.videoRepository.save(video);

      // 100% - Completado
      video.status = 'completed';
      video.processingProgress = 100;
      await this.videoRepository.save(video);

      console.log(`LOG: Procesamiento completado para video ${videoId}`);

    } catch (error) {
      console.error(`ERROR: Fallo procesando video ${videoId}`, error);
      await this.videoRepository.update(videoId, {
        status: 'failed',
        processingProgress: 0
      });
    }
  }

  async getJobStatus(id: string) {
    const video = await this.videoRepository.findOne({
      where: { id },
      select: ['status', 'processingProgress', 'type', 'id']
    });
    if (!video) throw new NotFoundException('Video not found');

    // Si está completado, devolvemos también el link para redirección
    const link = video.type === 'short' ? `/shorts/${video.id}` : `/watch/${video.id}`;

    return {
      status: video.status,
      progress: video.processingProgress,
      videoId: video.id,
      link: link
    };
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
      const key = `thumbnails/${uuidv4()}_${Date.now()}.${extension}`;

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
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: `thumbnails/${oldKey}`
          }));
        }

      } catch (err) {
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
      relations: ['channel', 'channel.user', 'tags'],
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
    // 1. Verificar Usuario y Canal
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User with ${userId} not found`);
    }

    const channel = user.channel;
    if (!channel) {
      throw new NotFoundException(`Channel not found for user ${userId}`);
    }

    const channelId = channel.channel_id;

    const countsResult = await this.videoRepository.createQueryBuilder("video")
      // Joins para Likes y Comentarios
      .leftJoin("video.likes", "like")
      .leftJoin("video.comments", "comment")

      // Seleccionar el ID del video y los conteos calculados
      .select("video.id", "video_id")
      .addSelect("COUNT(DISTINCT like.id)", "likeCount")
      .addSelect("COUNT(DISTINCT comment.id)", "commentCount")

      // Filtrar y agrupar solo por el video
      .where("video.channel_id = :channelId", { channelId: channelId })
      .groupBy("video.id")
      .getRawMany();

    // 3. Mapear los Conteos para Búsqueda Rápida
    const countsMap = countsResult.reduce((map, item) => {
      // Usamos el alias simple 'likeCount' y 'commentCount' de la consulta
      map[item.video_id] = {
        likes: parseInt(item.likeCount || '0', 10),
        comments: parseInt(item.commentCount || '0', 10)
      };
      return map;
    }, {});

    // 4.Obtener Videos con Relaciones (sin conflictos de agrupación)
    const videos = await this.videoRepository.find({
      where: { channel: { channel_id: channelId } },
      relations: ['channel', 'tags'], // Carga tags y canal
      order: { createdAt: 'DESC' },
    });

    return videos.map(video => ({
      ...video,
      video_likeCount: countsMap[video.id]?.likes ?? 0,
      video_commentCount: countsMap[video.id]?.comments ?? 0,
    }));
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

    // Eliminar video de S3
    if (video.url) {
      try {
        const videoKey = video.url.split('/').pop();
        if (videoKey) {
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: `videos/${videoKey}`
          }));
        }
      } catch (error) {
        console.error('Error deleting video from S3:', error);
      }
    }

    // Eliminar thumbnail de S3
    if (video.thumbnail) {
      try {
        const thumbnailKey = video.thumbnail.split('/').pop();
        if (thumbnailKey) {
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: `thumbnails/${thumbnailKey}`
          }));
        }
      } catch (error) {
        console.error('Error deleting thumbnail from S3:', error);
      }
    }

    await this.videoRepository.remove(video);
    return { message: 'Video deleted successfully' };
  }
}
