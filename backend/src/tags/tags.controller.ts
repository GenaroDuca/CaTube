import {
  Controller,
  Post,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import { TagService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { AssignTagsDto } from './dto/assign-tag.dto';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  createTag(@Body() dto: CreateTagDto) {
    return this.tagService.createTag(dto);
  }

  @Get()
  getAllTags() {
    return this.tagService.getAllTags();
  }

  @Post('assign')
  assignTagsToVideo(@Body() dto: AssignTagsDto) {
    return this.tagService.assignTagsToVideo(dto.video_id, dto.tagNames);
  }
}