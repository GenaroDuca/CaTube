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

  async create(
    createVideoDto: CreateVideoDto,
    userId: string,
    files: Express.Multer.File[]
  ) {
    try {
      // Buscar usuario
      const user = await this.userService.findOneById(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Obtener canal del usuario
      const channel = user.channel;
      if (!channel) {
        throw new NotFoundException(`Channel not found for user ${userId}`);
      }

      // Crear la entidad inicial del video
      const newVideo = this.videoRepository.create({
        ...createVideoDto,
        channel: channel,
      });

      // Crear la carpeta de destino si no existe
      const uploadDir = getUploadsPath('videos');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Validar que haya archivos
      if (!files || files.length === 0) {
        throw new Error('No files were uploaded');
      }

      // Procesar archivos
      for (const file of files) {
        const videoId = newVideo.id ?? Date.now().toString();

        const safeName = file.originalname.replace(/\s+/g, '_');
        const fileName = `${videoId}_${Date.now()}_${safeName}`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, file.buffer);

        const relativePath = `/uploads/videos/${fileName}`;

        if (file.mimetype.startsWith('image/')) {
          newVideo.thumbnail = relativePath;
        } else if (file.mimetype.startsWith('video/')) {
          newVideo.url = relativePath;
        }
      }

      // Validar que al menos tenga video
      if (!newVideo.url) {
        throw new Error('Video file is required but was not uploaded.');
      }

      // Obtener duración del video y determinar tipo
      const videoPath = path.join(process.cwd(), newVideo.url);
      const duration = await this.getVideoDuration(videoPath);
      newVideo.type = duration <= 60 ? 'short' : 'video';

      // Guardar el video en la base de datos
      await this.videoRepository.save(newVideo);

      // Generar link basado en el tipo
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

  // Get all videos
  async findAll() {
    return this.videoRepository.find({
      relations: ['channel'],
      order: { createdAt: 'DESC' },
    });
  }

  // Get all shorts
  async findAllShorts() {
    return this.videoRepository.find({
      where: { type: 'short' },
      relations: ['channel'],
      order: { createdAt: 'DESC' },
    });
  }

  // Get all videos only (excluding shorts)
  async findAllVideosOnly() {
    return this.videoRepository.find({
      where: { type: 'video' },
      relations: ['channel'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByChannel(userId: string) {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User with ${userId} not found`)
    }
    const channel = user.channel;
    if (!channel) {
      throw new NotFoundException(`Channel not found for user ${userId}`);
    }

    // Buscar todos los videos que pertenecen a ese canal
    const videos = await this.videoRepository.find({
      where: { channel: { channel_id: channel.channel_id } },
      relations: ['channel'],
      order: { createdAt: 'DESC' },
    });

    return videos;
  }

  // Update a video by its ID
  async update(id: string, updateVideoDto: UpdateVideoDto, files?: Express.Multer.File[]) {
    try {
      console.log('Starting video update:', {
        id,
        updateVideoDto,
        hasFiles: !!files?.length
      });

      const video = await this.videoRepository.findOne({
        where: { id },
        relations: ['channel', 'channel.user'],
      });

      if (!video) {
        console.log('Video not found:', id);
        throw new NotFoundException('Video not found');
      }

      // console.log('Found video to update:', {
      //   id: video.id,
      //   currentTitle: video.title,
      //   currentDescription: video.description,
      //   currentThumbnail: video.thumbnail,
      //   channelId: video.channel?.channel_id
      // });

      // Actualizar solo los campos proporcionados
      const updates: any = {};
      if (updateVideoDto.title !== undefined) {
        updates.title = updateVideoDto.title;
      }
      if (updateVideoDto.description !== undefined) {
        updates.description = updateVideoDto.description;
      }

      // Procesar el archivo de miniatura si se proporciona
      if (files && files.length > 0) {
        const thumbnailFile = files[0];

        if (!thumbnailFile.mimetype.startsWith('image/')) {
          throw new Error('El archivo debe ser una imagen');
        }

        try {
          const uploadDir = getUploadsPath('videos');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          const safeName = thumbnailFile.originalname.replace(/\s+/g, '_');
          const fileName = `${video.id}_${Date.now()}_${safeName}`;
          const filePath = path.join(uploadDir, fileName);

          // Escribir el nuevo archivo
          await fs.promises.writeFile(filePath, thumbnailFile.buffer);

          // Actualizar la ruta de la miniatura
          updates.thumbnail = `/uploads/videos/${fileName}`;

          // Eliminar la miniatura anterior si existe
          if (video.thumbnail) {
            const oldThumbnailPath = path.join(process.cwd(), video.thumbnail.replace(/^\//, ''));
            if (fs.existsSync(oldThumbnailPath)) {
              await fs.promises.unlink(oldThumbnailPath);
            }
          }

          console.log('Thumbnail updated successfully:', {
            newPath: updates.thumbnail,
            oldPath: video.thumbnail
          });
        } catch (fileError) {
          console.error('Error processing thumbnail:', fileError);
          throw new Error('Error al procesar la miniatura: ' + fileError.message);
        }
      }

      if (Object.keys(updates).length === 0) {
        throw new Error('No se proporcionaron cambios para actualizar');
      }

      console.log('Applying updates:', updates);

      // Aplicar las actualizaciones
      Object.assign(video, updates);

      // Guardar los cambios
      const updatedVideo = await this.videoRepository.save(video);
      console.log('Video updated successfully:', {
        id: updatedVideo.id,
        newTitle: updatedVideo.title,
        newDescription: updatedVideo.description,
        newThumbnail: updatedVideo.thumbnail
      });

      return {
        id: updatedVideo.id,
        title: updatedVideo.title,
        description: updatedVideo.description,
        thumbnail: updatedVideo.thumbnail,
        url: updatedVideo.url
      };
    } catch (error) {
      console.error('Error in video update:', {
        error: error.message,
        stack: error.stack,
        details: error
      });
      throw error;
    }
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

  async findAllByChannelId(channelId: string) {
    // Buscar todos los videos que pertenecen a ese canal
    const videos = await this.videoRepository.find({
      where: { channel: { channel_id: channelId } },
      relations: ['channel'],
      order: { createdAt: 'DESC' },
    });

    return videos;
  }

  async findOneById(id: string) {
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['channel', 'channel.user', 'tags'], // <-- agregamos tags
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

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

  private async getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          console.error('Error getting video duration:', err);
          reject(err);
        } else {
          const duration = metadata.format.duration || 0;
          resolve(duration);
        }
      });
    });
  }
}
