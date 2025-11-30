// posts/posts.module.ts (CORRECTO)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './entities/post.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { Subscription } from '../subs/entities/sub.entity';
import { ChannelsModule } from '../channels/channels.module'; // <-- ¡Importar el módulo!

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Subscription]),
    NotificationsModule,
    ChannelsModule, 
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule { }