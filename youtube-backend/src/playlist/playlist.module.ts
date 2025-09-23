import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist } from './entities/playlist.entity';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Playlist])],
  controllers: [PlaylistController],
  providers: [PlaylistService],
  exports: [PlaylistService],
})
export class PlaylistModule {}
