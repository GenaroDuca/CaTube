import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TagService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { AssignTagsDto } from './dto/assign-tag.dto';
import { AuthGuard } from '@nestjs/passport';
import { VideosService } from 'src/videos/videos.service';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService,
    private readonly videosService: VideosService,
  ) { }

  @Post()
  createTag(@Body() dto: CreateTagDto) {
    return this.tagService.createTag(dto);
  }

  @Get()
  getAllTags(@Query('q') q?: string) {
    return this.tagService.getAllTags(q);
  }


  @Post('assign')
  @UseGuards(AuthGuard('jwt'))
  async assignTags(@Body() assignTagsDto: AssignTagsDto) {
    const { video_id, tag_ids } = assignTagsDto;
    return this.tagService.assignTagsToVideo(video_id, tag_ids);
  }
}