import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Delete,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Channel } from '../channels/entities/channel.entity';
import { UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

@UseGuards(AuthGuard('jwt'))
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) { }

  // Create a new video
  @Post('create')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ], {
    storage: multer.memoryStorage()
  }))
  create(
    @Body() createVideoDto: CreateVideoDto,
    @Req() req,
    @UploadedFiles() files: {
      thumbnail?: Express.Multer.File[],
      video?: Express.Multer.File[]
    },
  ) {
    const userId = req.user.id
    const allFiles: Express.Multer.File[] = [
      ...(files.thumbnail ?? []),
      ...(files.video ?? [])
    ];
    return this.videosService.create(createVideoDto, userId, allFiles)
  }

  // Visitas inclementales
  @Post(':id/views')
  async incrementViews(@Param('id', ParseUUIDPipe) id: string) {
    await this.videosService.incrementViews(id);
    return { message: 'Views incremented successfully' };
  }

  // Get all videos
  @Get()
  findAll() {
    return this.videosService.findAll();
  }

  @Get('by-tag/:tag')
  async getVideosByTag(@Param('tag') tag: string) {
    return this.videosService.getVideosByTag(tag);
  }

  // Get all shorts
  @Get('shorts')
  findAllShorts() {
    return this.videosService.findAllShorts();
  }

  // Get all videos only (excluding shorts)
  @Get('videos-only')
  findAllVideosOnly() {
    return this.videosService.findAllVideosOnly();
  }

  //Get all videos for logged-in user's channel
  @Get('my-videos')
  @UseGuards(AuthGuard('jwt'))
  findAllByChannel(@Req() req) {
    const userId = req.user.id;
    return this.videosService.findAllByChannel(userId.toString());
  }


  @Get('education')
  findEducationalVideos() {
    return this.videosService.findEducationalVideos();
  }

  // Get single video by id (public)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.videosService.findOneById(id);
  }

  // Get all videos by channel ID
  @Get('channel/:channelId')
  findAllByChannelId(@Param('channelId', ParseUUIDPipe) channelId: string) {
    return this.videosService.findAllByChannelId(channelId);
  }



  // Update a video by its ID
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'thumbnail', maxCount: 1 }
  ], {
    storage: multer.memoryStorage()
  }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVideoDto: UpdateVideoDto,
    @UploadedFiles() files: { thumbnail?: Express.Multer.File[] },
    @Req() req: any
  ) {
    try {
      if (!req.user || !req.user.id) {
        throw new ForbiddenException('Usuario no autenticado');
      }

      // console.log('Update video request:', {
      //   id,
      //   dto: updateVideoDto,
      //   userId: req.user.id,
      //   hasFiles: !!files?.thumbnail?.length,
      //   fileInfo: files?.thumbnail?.[0] ? {
      //     fieldname: files.thumbnail[0].fieldname,
      //     originalname: files.thumbnail[0].originalname,
      //     mimetype: files.thumbnail[0].mimetype,
      //     size: files.thumbnail[0].size
      //   } : null
      // });

      // Obtener el video con todas las relaciones y validar propiedad
      const video = await this.videosService.findOneById(id);

      // Verificar que el usuario actual es el propietario
      if (video.channel.user.user_id !== req.user.id) {
        throw new ForbiddenException('No tienes permiso para actualizar este video');
      }

      // Proceder con la actualización
      const thumbnailFiles = files?.thumbnail || [];
      const result = await this.videosService.update(id, updateVideoDto, thumbnailFiles);

      console.log('Video actualizado exitosamente:', {
        id: result.id,
        title: result.title,
        thumbnail: result.thumbnail
      });

      return result;

    } catch (error) {
      // Log detallado del error
      console.error('Error updating video:', {
        error: error.message,
        stack: error.stack,
        details: error
      });

      // Re-throw para que NestJS maneje la respuesta de error
      throw error;
    }
  }

  // Delete a video by its ID
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.videosService.remove(id, userId);
  }
}