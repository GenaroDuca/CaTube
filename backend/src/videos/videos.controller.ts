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
  Delete
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

  // Get all videos
  @Get()
  findAll() {
    return this.videosService.findAll();
  }

  // Update a video by its ID
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVideoDto: UpdateVideoDto,
    @Req() req: any
  ) {
    const channel = req.user.channel as Channel;
    return this.videosService.update(id, updateVideoDto, channel);
  }

  // Delete a video by its ID
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const channel = req.user.channel as Channel;
    return this.videosService.remove(id, channel);
  }
}