import { Controller, Post, Body, UseGuards, Req, Get, Param, ParseUUIDPipe, Patch, Delete } from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { AuthGuard } from '@nestjs/passport';
import { Video } from './entities/video.entity';
import { User } from 'src/users/entities/user.entity';
import { UpdateVideoDto } from './dto/update-video.dto';

@Controller('videos/:videoId')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  //Create a new video
  @Post()
  @UseGuards(AuthGuard('jwt')) //Protect this route with JWT authentication
  create(
    @Body() createVideoDto: CreateVideoDto,
    @Req() req: any
  ){
    const user = req.user as User; //Obtain the authenticated user from the request
    return this.videosService.create(createVideoDto, user);
  }

  //Get all videos
  @Get()
  findAll(@Param('videoId', ParseUUIDPipe) videoId: string) {
    return this.videosService.findAll(videoId);
  }

  //Update a video by its ID
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVideoDto: UpdateVideoDto,
    @Req() req: any,
  ) {
    const user = req.user as User;
    return this.videosService.update(id, updateVideoDto, user);
  }

  //Delete a video by its ID
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ){
    const user = req.user as User;
    return this.videosService.remove(id, user);
  }
}
