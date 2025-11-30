import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ChannelsModule } from 'src/channels/channels.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LikesModule } from '../likes/likes.module';
import { History } from './entities/history.entity';
import { WatchLater } from './entities/watch-later.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, History, WatchLater]),
    forwardRef(() => ChannelsModule),
    NotificationsModule,
    LikesModule

  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
