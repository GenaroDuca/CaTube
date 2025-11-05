import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/entities/user.entity';
import { Channel } from './channels/entities/channel.entity';
import { ChannelsModule } from './channels/channels.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { StoreModule } from './store/store.module';
import { Store } from './store/entities/store.entity';
import { Product } from './product/entities/product.entity';
import { Playlist } from './playlist/entities/playlist.entity';
import { Video } from './videos/entities/video.entity';
import { Comment } from './comments/entities/comment.entity';
import { Like } from './likes/entities/like.entity';
import { Subscription } from './subs/entities/sub.entity';
import { PlaylistVideosModule } from './playlist_videos/playlist_videos.module';
import { PlaylistVideo } from './playlist_videos/entities/playlist_video.entity';
import { ConfigModule } from '@nestjs/config';
import { Friendship } from './friendships/entities/friendship.entity';
import { FriendshipsModule } from './friendships/friendships.module';
import { NotificationsModule } from './notifications/notifications.module';
import { Notification } from './notifications/entities/notification.entity';
import { Message } from './messages/entities/message.entity';
import { Room } from './rooms/entities/room.entity';
import { MessagesModule } from './messages/messages.module';
import { RoomsModule } from './rooms/rooms.module';
import { ChatGateway } from './chat/chat.gateway';
import { SubscriptionsModule } from './subs/subs.module';
import { VideosModule } from './videos/videos.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'Colo123',
      database: 'catube_db',
      // logging: true,
      entities: [User, Channel, Store, Product, Playlist, Video, Comment, Like, Subscription, PlaylistVideo, Friendship, Notification, Message, Room],
      synchronize: true,
    }),

    ConfigModule.forRoot({
      envFilePath: ['config.env'],
      isGlobal: true,
    }),

    UsersModule,

    ChannelsModule,

    AuthModule,

    ProductModule,

    StoreModule,

    PlaylistVideosModule,

    FriendshipsModule,

    NotificationsModule,

    MessagesModule,

    RoomsModule,
    
    SubscriptionsModule,

    VideosModule
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule { }
