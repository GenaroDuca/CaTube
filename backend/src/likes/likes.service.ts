import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { Video } from '../videos/entities/video.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,

    @InjectRepository(Video)
    private readonly videosRepository: Repository<Video>,

    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,

    private readonly notificationsService: NotificationsService,
  ) { }

  // Create or update a like/dislike on a video or a comment.
  async react(
    user: User,
    like: boolean,
    videoId?: string | null,
    commentId?: string | null,
  ) {
    if (!videoId && !commentId) {
      throw new BadRequestException('Either videoId or commentId must be provided');
    }

    let likedDisliked: Like | null = null;
    let targetOwnerId: string | null = null;

    // -------------------------
    // LIKE / DISLIKE ON VIDEO
    // -------------------------
    if (videoId && !commentId) {
      const video = await this.videosRepository.findOne({
        where: { id: videoId },
        relations: ['channel', 'channel.user'],
      });

      if (!video) throw new NotFoundException('Video not found');

      targetOwnerId = video.channel?.user?.user_id || null;

      likedDisliked = await this.likesRepository.findOne({
        where: {
          user: { user_id: user.user_id },
          video: { id: videoId },
        },
      });

      // Removida la variable 'isLikeAction'
      // const isLikeAction = like === true; 

      if (likedDisliked) {
        likedDisliked.like = like;
        return this.likesRepository.save(likedDisliked);
      }

      const newLike = this.likesRepository.create({ user, video, comment: null, like });

      // --- LÓGICA DE VALIDACIÓN DE URL ---
      const isShort = video.type === 'short';
      const videoUrl = isShort ? `/shorts/${videoId}` : `/watch/${videoId}`;
      // ------------------------------------

      // CORRECCIÓN AQUÍ: Usamos 'like' directamente
      if (like && targetOwnerId && targetOwnerId !== user.user_id) {
        try {
          await this.notificationsService.createNotification(
            targetOwnerId,
            user.user_id,
            NotificationType.LIKE_VIDEO,
            `liked your video: ${video.title.substring(0, 30)}...`,
            videoUrl, // URL DINÁMICA
          );
        } catch (e) {
          console.error('Failed to create LIKE_VIDEO notification:', e);
        }
      }

      return this.likesRepository.save(newLike);
    }

    // -------------------------
    // LIKE / DISLIKE ON COMMENT
    // -------------------------
    if (commentId) {
      const comment = await this.commentsRepository.findOne({
        where: { id: commentId },
        relations: ['user', 'video'], // Aseguramos que 'video' esté incluido
      });

      if (!comment) throw new NotFoundException('Comment not found');
      if (!comment.video) throw new NotFoundException('Comment video not found');

      targetOwnerId = comment.user?.user_id || null;

      likedDisliked = await this.likesRepository.findOne({
        where: {
          user: { user_id: user.user_id },
          comment: { id: commentId },
        },
      });

      // Removida la variable 'isLikeAction'
      // const isLikeAction = like === true;

      if (likedDisliked) {
        likedDisliked.like = like;
        return this.likesRepository.save(likedDisliked);
      }

      const newLike = this.likesRepository.create({ user, video: null, comment, like });

      // --- LÓGICA DE VALIDACIÓN DE URL ---
      const isShort = comment.video.type === 'short';
      const videoId = comment.video.id;
      const videoUrl = isShort ? `/shorts/${videoId}` : `/watch/${videoId}`;
      // ------------------------------------

      // CORRECCIÓN AQUÍ: Usamos 'like' directamente
      if (like && targetOwnerId && targetOwnerId !== user.user_id) {
        try {
          await this.notificationsService.createNotification(
            targetOwnerId,
            user.user_id,
            NotificationType.LIKE_COMMENT,
            `liked your comment: ${comment.content.substring(0, 50)}...`,
            videoUrl, // URL DINÁMICA
          );
        } catch (e) {
          console.error('Failed to create LIKE_COMMENT notification:', e);
        }
      }

      return this.likesRepository.save(newLike);
    }
  }

  // Remove an existing like/dislike
  async removeReact(
    user: User,
    videoId?: string | null,
    commentId?: string | null,
  ) {
    let likedDisliked: Like | null = null;

    if (videoId && !commentId) {
      likedDisliked = await this.likesRepository.findOne({
        where: {
          user: { user_id: user.user_id },
          video: { id: videoId },
        },
      });
    }

    if (commentId) {
      likedDisliked = await this.likesRepository.findOne({
        where: {
          user: { user_id: user.user_id },
          comment: { id: commentId },
        },
      });
    }

    if (!likedDisliked) {
      throw new NotFoundException('Reaction not found');
    }

    return this.likesRepository.remove(likedDisliked);
  }

  // Count likes and dislikes for a video or comment.
  async countLikesDislikes(
    videoId?: string | null,
    commentId?: string | null,
  ) {
    let likes = 0;
    let dislikes = 0;

    if (videoId && !commentId) {
      likes = await this.likesRepository.count({
        where: { video: { id: videoId }, like: true },
      });
      dislikes = await this.likesRepository.count({
        where: { video: { id: videoId }, like: false },
      });
    }

    if (commentId) {
      likes = await this.likesRepository.count({
        where: { comment: { id: commentId }, like: true },
      });
      dislikes = await this.likesRepository.count({
        where: { comment: { id: commentId }, like: false },
      });
    }

    return { likes, dislikes };
  }

  // Get user's reaction on a video or comment
  async getUserReaction(
    userId: string,
    videoId?: string | null,
    commentId?: string | null,
  ) {
    let likedDisliked: Like | null = null;

    if (videoId && !commentId) {
      likedDisliked = await this.likesRepository.findOne({
        where: {
          user: { user_id: userId },
          video: { id: videoId },
        },
      });
    }

    if (commentId) {
      likedDisliked = await this.likesRepository.findOne({
        where: {
          user: { user_id: userId },
          comment: { id: commentId },
        },
      });
    }

    if (!likedDisliked) return { reaction: null };
    return { reaction: likedDisliked.like ? 'like' : 'dislike' };
  }

  // Get recent likes on user's videos
  async getRecentLikesOnUserVideos(userId: string, limit: number = 10) {
    const likes = await this.likesRepository.find({
      where: {
        video: {
          channel: {
            user: { user_id: userId },
          },
        },
        like: true,
      },
      relations: ['user', 'user.channel', 'video'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return likes.map((like) => ({
      id: like.id,
      user: {
        id: like.user.user_id,
        username: like.user.username,
        photoUrl: like.user.channel?.photoUrl,
      },
      video: {
        id: like.video?.id,
        title: like.video?.title,
        thumbnail: like.video?.thumbnail,
        type: like.video?.type,
      },
      createdAt: like.createdAt,
    }));
  }
}