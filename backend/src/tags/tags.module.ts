import { Module } from '@nestjs/common';
import { TagService } from './tags.service';
import { TagController } from './tags.controller';
import { Video } from '../videos/entities/video.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, Video])],
  controllers: [TagController,],
  providers: [TagService],

})
export class TagsModule { }
