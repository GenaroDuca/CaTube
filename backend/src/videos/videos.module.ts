import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { UsersModule } from '../users/users.module';
import { MulterModule } from '@nestjs/platform-express';
import { Tag } from 'src/tags/entities/tag.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { SubscriptionsModule } from 'src/subs/subs.module';
import { Subscription } from 'src/subs/entities/sub.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video, Tag, Subscription]),
    UsersModule,
    NotificationsModule,
    SubscriptionsModule,
    MulterModule.register({
      dest: './uploads'
    }),

  ],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService]
})
export class VideosModule { }
