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
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly notificationsService: NotificationsService,

  ) { }

  async create(createCommentDto: CreateCommentDto, userId: string, videoId: string) {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['channel'],
    });

    if (!user) throw new NotFoundException('User not found');

    // 1: Cargar el video con la relación Channel y User para obtener el dueño.
    const video = await this.videoRepository.findOne({
      where: { id: videoId },
      relations: ['channel', 'channel.user'], 
    });

    if (!video) throw new NotFoundException('Video not found');

    let parentCommentAuthorId: string | null = null;
    let parentComment: any = null;

    // Check if this is a reply (has parentCommentId)
    if (createCommentDto.parentCommentId) {
      // 2: Cargar el comentario padre con su relación User para obtener el autor.
      parentComment = await this.commentRepository.findOne({
        where: { id: createCommentDto.parentCommentId },
        relations: ['user'], 
      });

      if (!parentComment) {
        console.log('Parent comment not found!');
        throw new NotFoundException('Parent comment not found');
      }
      console.log('Parent comment found:', parentComment.id);

      // Guardar el ID del autor del comentario padre
      parentCommentAuthorId = parentComment.user.user_id;
    }

    // Create comment with proper structure
    const commentData: any = {
      content: createCommentDto.content,
      user,
      video,
    };

    // Only add parentComment if it exists
    if (createCommentDto.parentCommentId) {
      commentData.parentComment = parentComment || { id: createCommentDto.parentCommentId };
    }

    const insertResult = await this.commentRepository.insert(commentData);
    const newCommentId = insertResult.identifiers[0].id;

    // ENVIAR NOTIFICACIONES

    // LÓGICA DE VALIDACIÓN DE URL AÑADIDA AQUÍ
    const isShort = video.type === 'short';
    const videoUrl = isShort ? `/shorts/${videoId}` : `/watch/${videoId}`;

    // 1. Notificación al dueño del video (si el autor del comentario no es el dueño)
    const videoOwnerId = video.channel?.user?.user_id;

    if (videoOwnerId && videoOwnerId !== userId) {
      try {
        await this.notificationsService.createNotification(
          videoOwnerId, // Receptor: Dueño del video
          userId, // Emisor: Autor del comentario
          NotificationType.NEW_COMMENT,
          `commented your video: ${video.title.substring(0, 25)}...`,
          videoUrl // ¡URL DINÁMICA!
        );
      } catch (e) {
        console.error('Failed to create NEW_COMMENT notification:', e);
      }
    }

    // 2. Notificación al dueño del comentario padre (si es una respuesta y no es el mismo usuario)
    if (parentCommentAuthorId && parentCommentAuthorId !== userId) {
      try {
        await this.notificationsService.createNotification(
          parentCommentAuthorId,
          userId,
          NotificationType.REPLY_COMMENT,
          `replied to your comment: ${parentComment.content.substring(0, 25)}...`,
          videoUrl // ¡URL DINÁMICA!
        );
      } catch (e) {
        console.error('Failed to create REPLY_COMMENT notification:', e);
      }
    }

    // 2. Notificación al dueño del comentario padre (si es una respuesta y no es el mismo usuario)
    if (parentCommentAuthorId && parentCommentAuthorId !== userId) {
      try {
        await this.notificationsService.createNotification(
          parentCommentAuthorId,
          userId,
          NotificationType.REPLY_COMMENT,
          `replied to your comment: ${parentComment.content.substring(0, 25)}...`,
          `/watch/${videoId}`
        );
      } catch (e) {
        console.error('Failed to create REPLY_COMMENT notification:', e);
      }
    }

    // --- FIN DE NOTIFICACIONES ---

    // Obtener el comentario completo para el DTO de respuesta
    const fullComment = await this.commentRepository.findOne({
      where: { id: newCommentId },
      relations: ['user', 'user.channel', 'replies', 'likes', 'parentComment'],
    });

    if (!fullComment) {
      throw new NotFoundException('Failed to retrieve created comment');
    }

    return {
      id: fullComment.id,
      username: fullComment.user.username,
      user_id: fullComment.user.user_id,
      channelUrl: fullComment.user.channel?.url || null,
      photoUrl: fullComment.user.avatarUrl || `https://catube-uploads.s3.sa-east-1.amazonaws.com/profile/${fullComment.user.username.charAt(0).toUpperCase()}.png`,
      content: fullComment.content,
      createdAt: fullComment.createdAt,
      updatedAt: fullComment.updatedAt,
      likesCount: (fullComment.likes ?? []).filter(l => l.like).length,
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
      photoUrl: comment.user.avatarUrl || `https://catube-uploads.s3.sa-east-1.amazonaws.com/profile/${comment.user.username.charAt(0).toUpperCase()}.png`,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      likesCount: (comment.likes ?? []).filter(like => like.like).length,
      replies: (comment.replies ?? []).map(reply => ({
        id: reply.id,
        username: reply.user.username,
        user_id: reply.user.user_id,
        channelUrl: reply.user.channel?.url || null,
        photoUrl: reply.user.avatarUrl || `https://catube-uploads.s3.sa-east-1.amazonaws.com/profile/${reply.user.username.charAt(0).toUpperCase()}.png`,
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
      userPhoto: comment.user.avatarUrl || `https://catube-uploads.s3.sa-east-1.amazonaws.com/profile/${comment.user.username.charAt(0).toUpperCase()}.png`,
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
