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

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  // Create a new video
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createVideoDto: CreateVideoDto, @Req() req: any) {
    const channel = req.user.channel as Channel; // Asegurate de que el usuario tenga un canal cargado en el JWT
    return this.videosService.create(createVideoDto, channel);
  }

  // Get all videos
  @Get()
  findAll() {
    return this.videosService.findAll();
  }

  // Update a video by its ID
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const channel = req.user.channel as Channel;
    return this.videosService.remove(id, channel);
  }
}