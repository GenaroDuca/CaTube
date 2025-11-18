import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../users/entities/user.entity';
import { Video } from 'src/videos/entities/video.entity';
import { IsNull } from 'typeorm';
import { channel } from 'diagnostics_channel';


@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {}

  //Create a comment
  // Create a comment
async create(
  createCommentDto: CreateCommentDto,
  user: User,
  videoId: string,
) {
  const video = await this.videoRepository.findOne({
    where: { id: videoId },
  });

  if (!video) throw new NotFoundException('Video not found');

  let parentComment: Comment | null = null;

  if (createCommentDto.parentCommentId) {
    parentComment = await this.commentRepository.findOne({
      where: { id: createCommentDto.parentCommentId },
    });

    if (!parentComment) {
      throw new NotFoundException('Parent comment not found');
    }
  }

  const comment = this.commentRepository.create({
    content: createCommentDto.content,
    user,
    video,
    parentComment: parentComment ?? null,
  } as Partial<Comment>);

  const savedComment = await this.commentRepository.save(comment);

  return {
    id: savedComment.id,
    username: savedComment.user.username,
    user_id: savedComment.user.user_id,
    channelUrl: comment.user.channel?.url || null,
    photoUrl: comment.user.channel?.photoUrl || null,
    content: savedComment.content,
    createdAt: savedComment.createdAt.toISOString(),
    updatedAt: savedComment.updatedAt.toISOString(),
    likesCount: (comment.likes ?? []).filter(like => like.like).length,
    replies: (comment.replies ?? []).map(reply => ({
      id: reply.id,
      username: reply.user.username,
      user_id: reply.user.user_id,
      channelUrl: reply.user.channel?.url || null,
      photoUrl: reply.user.channel?.photoUrl || null,
      content: reply.content,
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString(),
      likesCount: (reply.likes ?? []).filter(like => like.like).length,
    })),
  };
}

//Get all comments for a specific video
async findAll(videoId: string) {
  const videoExists = await this.videoRepository.exist({
    where: { id: videoId },
  });

  if (!videoExists) throw new NotFoundException('Video not found');

  const comments = await this.commentRepository.find({
    where: {
      video: { id: videoId },
      parentComment: IsNull(),
    },
    relations: ['user', 'user.channel', 'likes', 'replies', 'replies.user.channel','replies.user'],
    order: { createdAt: 'DESC' },
  });

  return comments.map((comment) => ({
    id: comment.id,
    username: comment.user.username,
    user_id: comment.user.user_id,
    channelUrl: comment.user.channel?.url || null,
    photoUrl: comment.user.channel?.photoUrl || null,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    likesCount: (comment.likes ?? []).filter(like => like.like).length,
    replies: (comment.replies ?? []).map(reply => ({
      id: reply.id,
      username: reply.user.username,
      user_id: reply.user.user_id,
      channelUrl: reply.user.channel?.url || null,
      photoUrl: reply.user.channel?.photoUrl || null,
      content: reply.content,
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString(),
      likesCount: (reply.likes ?? []).filter(like => like.like).length,
    })),
  }));
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

    comment.content = updateCommentDto.content ?? comment.content;

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
