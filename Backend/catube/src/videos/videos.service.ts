import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { User } from 'src/users/entities/user.entity';
// import { Media } from 'src/media/entities/media.entity';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,

    // @InjectRepository(Media)
    // private readonly mediaRepository: Repository<Media>,
  ) {}

  //Create a new video
  async create(createVideoDto: CreateVideoDto, user: User) {
    const video = await this.videoRepository.create({
      ...createVideoDto,
      user,
    });
    return await this.videoRepository.save(video);
  }

  //Get all videos
  async findAll(videoId: string) {
    return this.videoRepository.find({
      where: { id: videoId },
      relations: ['user'], //Return user data with the video
      order: { createdAt: 'DESC' },
    });
  }

  //Update a video by its ID
  async update(id: string, updateVideoDto: UpdateVideoDto, user: User) {
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!video) throw new NotFoundException('Video not found');
    if (video.user.user_id !== user.user_id) {
      throw new ForbiddenException('You cannot edit this video');
    }

    Object.assign(video, updateVideoDto); //Update only the fields present in updateVideoDto
    return await this.videoRepository.save(video);
  }

  //Delete a video by its ID
  async remove(id: string, user: User) {
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    //if video not found, throw 404 error
    if (!video) throw new NotFoundException('Video not found');

    //Check if the authenticated user is the owner of the video
    if (video.user.user_id !== user.user_id) {
      //If not, throw 403 error
      throw new ForbiddenException('You cannot delete this video');
    };

    await this.videoRepository.remove(video); //Delete the video
    return { message: 'Video deleted successfully' }; //Return a success message
  }
}
