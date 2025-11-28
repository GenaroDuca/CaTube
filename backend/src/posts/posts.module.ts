import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './entities/post.entity';
import { NotificationsModule } from '../notifications/notifications.module'; 
import { Subscription } from '../subs/entities/sub.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Subscription]), NotificationsModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
