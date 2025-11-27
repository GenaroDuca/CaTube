import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { Video } from '../videos/entities/video.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';


@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,


    @InjectRepository(Video)
    private readonly videosRepository: Repository<Video>,


    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) { }


  // Create or update a like/dislike on a video or a comment.
  async react(
    user: User,
    like: boolean,
    videoId?: string | null,
    commentId?: string | null
  ) {
    // At least one target must be provided.
    if (!videoId && !commentId) {
      throw new BadRequestException(
        'Either videoId or commentId must be provided'
      );
    }


    let likedDisliked: Like | null = null;


    // -------------------------
    // LIKE / DISLIKE ON VIDEO
    // -------------------------
    if (videoId && !commentId) {
      const video = await this.videosRepository.findOne({
        where: { id: videoId },
      });


      if (!video) throw new NotFoundException('Video not found');


      // Check if the user already reacted to this video
      likedDisliked = await this.likesRepository.findOne({
        where: {
          user: { user_id: user.user_id },
          video: { id: videoId },
        },
      });


      // Update existing reaction
      if (likedDisliked) {
        likedDisliked.like = like;
        return this.likesRepository.save(likedDisliked);
      }


      // Create new reaction
      const newLike = this.likesRepository.create({ user, video, comment: null, like, });
      return this.likesRepository.save(newLike);
    }


    // LIKE / DISLIKE ON COMMENT
    if (commentId) {
      const comment = await this.commentsRepository.findOne({
        where: { id: commentId },
      });


      if (!comment) throw new NotFoundException('Comment not found');


      // Check if user already reacted to this comment
      likedDisliked = await this.likesRepository.findOne({
        where: {
          user: { user_id: user.user_id },
          comment: { id: commentId },
        },
      });


      // Update existing reaction
      if (likedDisliked) {
        likedDisliked.like = like;
        return this.likesRepository.save(likedDisliked);
      }


      // Create new reaction
      const newLike = this.likesRepository.create({ user, video: null, comment, like });
      return this.likesRepository.save(newLike);
    }
  }


  //Remove an existing like/dislike  
  async removeReact(
    user: User,
    videoId?: string | null,
    commentId?: string | null
  ) {
    let likedDisliked: Like | null = null;


    // Remove reaction on a video
    if (videoId && !commentId) {
      likedDisliked = await this.likesRepository.findOne({
        where: {
          user: { user_id: user.user_id },
          video: { id: videoId },
        },
      });
    }


    // Remove reaction on a comment
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


  //Count likes and dislikes for a video or comment.
  async countLikesDislikes(
    videoId?: string | null,
    commentId?: string | null
  ) {
    let likes = 0;
    let dislikes = 0;


    //Count reactions on a video
    if (videoId && !commentId) {
      likes = await this.likesRepository.count({
        where: { video: { id: videoId }, like: true },
      });


      dislikes = await this.likesRepository.count({
        where: { video: { id: videoId }, like: false },
      });
    }


    //Count reactions on a comment
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
    commentId?: string | null
  ) {
    let likedDisliked: Like | null = null;

    // Check reaction on a video
    if (videoId && !commentId) {
      likedDisliked = await this.likesRepository.findOne({
        where: {
          user: { user_id: userId },
          video: { id: videoId },
        },
      });
    }

    // Check reaction on a comment
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
            user: { user_id: userId }
          }
        },
        like: true
      },
      relations: ['user', 'user.channel', 'video'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return likes.map(like => ({
      id: like.id,
      user: {
        id: like.user.user_id,
        username: like.user.username,
        photoUrl: like.user.channel?.photoUrl
      },
      video: {
        id: like.video?.id,
        title: like.video?.title,
        thumbnail: like.video?.thumbnail,
        type: like.video?.type
      },
      createdAt: like.createdAt
    }));
  }
}