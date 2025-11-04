import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Channel } from '../channels/entities/channel.entity';
import { UsersService } from 'src/users/users.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private userService: UsersService,
  ) { }

  async create(createVideoDto: CreateVideoDto, userId: string, files: Express.Multer.File[]) {
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
      const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'videos');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Validar que haya archivos
      if (!files || files.length === 0) {
        throw new Error('No files were uploaded');
      }

      // Procesar archivos
      for (const file of files) {
        // Asegurar que newVideo tenga un id (si usas uuid generado por DB, lo generamos temporalmente)
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

      // Guardar el video en la base de datos
      await this.videoRepository.save(newVideo);

      return newVideo;

    } catch (err) {
      console.error(' Error creating video:', err);
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