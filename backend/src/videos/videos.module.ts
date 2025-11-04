import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { UsersModule } from '../users/users.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video]),
    UsersModule,
    MulterModule.register({
      dest:'./uploads'
    })
  ],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
