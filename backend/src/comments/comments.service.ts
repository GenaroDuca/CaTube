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

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,


  ) { }

  //Create a comment
  async create(createCommentDto: CreateCommentDto, userId: string, videoId: string) {

    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['channel'], // si necesitas
    });

    if (!user) throw new NotFoundException('User not found');

    const video = await this.videoRepository.findOne({
      where: { id: videoId },
    });

    if (!video) throw new NotFoundException('Video not found');

    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      user,
      video,
      parentComment: undefined,
    });

    const savedComment = await this.commentRepository.save(comment);

    const fullComment = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user', 'user.channel', 'replies', 'likes'],
    });

    return {
      id: fullComment?.id,
      username: fullComment?.user.username,
      user_id: fullComment?.user.user_id,
      channelUrl: fullComment?.user.channel?.url || null,
      photoUrl: fullComment?.user.channel?.photoUrl || null,
      content: fullComment?.content,
      createdAt: fullComment?.createdAt,
      updatedAt: fullComment?.updatedAt,
      likesCount: (fullComment?.likes ?? []).filter(l => l.like).length,
      replies: [],
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
      relations: ['user', 'user.channel', 'likes', 'replies', 'replies.user.channel', 'replies.user'],
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

  // Get latest comments on user's videos
  async getUserComments(userId: string, limit: number = 4) {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['channel'],
    });

    if (!user || !user.channel) throw new NotFoundException('User or channel not found');

    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('user.channel', 'userChannel')
      .leftJoinAndSelect('comment.video', 'video')
      .leftJoinAndSelect('video.channel', 'videoChannel')
      .where('videoChannel.channel_id = :channelId', { channelId: user.channel.channel_id })
      .andWhere('comment.parentComment IS NULL')
      .andWhere('comment.user.user_id != :userId', { userId: user.user_id })
      .orderBy('comment.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return comments.map(comment => ({
      id: comment.id,
      username: comment.user.username,
      userPhoto: comment.user.channel?.photoUrl || null,
      message: comment.content,
      videoThumbnail: comment.video.thumbnail,
      title: comment.video.title,
      channelUrl: comment.user.channel?.url || null,
      videoId: comment.video.id,
      videoType: comment.video.type,
      createdAt: comment.createdAt.toISOString(),
    }));
  }

  // Get comment count for a specific video
  async getCommentCount(videoId: string): Promise<number> {
    const count = await this.commentRepository.count({
      where: { video: { id: videoId } },
    });
    return count;
  }
}
