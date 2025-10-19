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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',       
      password: 'Colo123',   
      database: 'catube_db',
      entities: [User, Channel, Store, Product, Playlist, Video, Comment, Like, Subscription, PlaylistVideo],       
      synchronize: true,      
    }),

    UsersModule,

    ChannelsModule,

    AuthModule,

    ProductModule,

    StoreModule,

    PlaylistVideosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}