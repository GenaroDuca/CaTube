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
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User with ${userId} not found`)
    }
    const channel = user.channel;

    // 1. Crear la entidad sin guardar aún.
    const newVideo = this.videoRepository.create({
      ...createVideoDto,
      channel: channel,
    });

    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'videos', 'videosDir')

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // 2. Procesar archivos y asignar las URLs.
    for (const file of files) {
      const fileName = `${newVideo.id}_${Date.now()}_${file.originalname}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, file.buffer);

      const relativePath = `/uploads/videos/videosDir/${fileName}`;

      if (file.mimetype.startsWith('image/')) {
        newVideo.thumbnail = relativePath;
      } else if (file.mimetype.startsWith('video/')) {
        newVideo.url = relativePath;
      }
    }

    // Validación obligatoria si el campo 'url' es NOT NULL.
    if (!newVideo.url) {
      throw new Error('Video file is required but was not uploaded.');
    }

    // 3. Guardar la entidad en la base de datos (UNA SOLA VEZ, con todos los campos obligatorios llenos).
    await this.videoRepository.save(newVideo);
    return newVideo;
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