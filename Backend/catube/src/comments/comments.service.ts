import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from 'src/users/entities/user.entity';
import { Video } from 'src/videos/entities/video.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {}

  //Create a comment
  async create(createCommentDto: CreateCommentDto, user: User, videoId: string) {
    const video = await this.videoRepository.findOne({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');

    const comment = this.commentRepository.create({
      ...createCommentDto,
      user,
      video,
    });

    return await this.commentRepository.save(comment);
  }

  //Get all comments for a video
  async findAll(videoId: string) {
    return this.commentRepository.find({
      where: { video: { id: videoId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  //Update a comment
  async update(id: string, updateCommentDto: UpdateCommentDto, user: User) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.user.user_id !== user.user_id) {
      throw new ForbiddenException('You cannot edit this comment');
    }
    if (updateCommentDto.content !== undefined) {
      comment.content = updateCommentDto.content;
    }
    return await this.commentRepository.save(comment);
  }

  //Delete a comment
  async remove(id: string, user: User) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.user.user_id !== user.user_id) {
      throw new ForbiddenException('You cannot delete this comment');
    }

    await this.commentRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }
}
