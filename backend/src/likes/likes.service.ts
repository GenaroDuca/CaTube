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
    private readonly likesRepository: Repository<Like>,
    private readonly videosRepository: Repository<Video>,
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  //User can like or dislike a video or comment
  async react(user: User, like: boolean, videoId?: string, commentId?: string) 
  {
    //if neither videoId nor commentId is provided, throw an error
    if (!videoId && !commentId) {
      throw new BadRequestException('Either videoId or commentId must be provided');
    }

    let target;
    let likedDisliked: Like | null = null;

    //If videoId is provided, find the video and check if the user has already liked/disliked it
    if (videoId) {
      target = await this.videosRepository.findOne({ where: { id: videoId }, relations: ['likes'] });
      if (!target) throw new NotFoundException('Video not found');
      likedDisliked = await this.likesRepository.findOne({ where: { user: { user_id: user.user_id }, video: { id: videoId } } });
    }

    //If commentId is provided, find the comment and check if the user has already liked/disliked it
    if (commentId) {
      target = await this.commentsRepository.findOne({ where: { id: commentId }, relations: ['likes'] });
      if (!target) throw new NotFoundException('Comment not found');
      likedDisliked = await this.likesRepository.findOne({ where: { user: { user_id: user.user_id }, comment: { id: commentId } } });
    }

    //If the user has already liked/disliked the target, update the like value
    if (likedDisliked) {
      likedDisliked.like = like;
      return this.likesRepository.save(likedDisliked);
    }

    //If the user hasn't liked/disliked the target yet, create a new like/dislike
    const newLike = this.likesRepository.create({ 
      user,
      video: videoId ? target : null,
      comment: commentId ? target : null,
      like
    });
    return this.likesRepository.save(newLike);
  }

  //Remove like/dislike
  async removeReact(user: User, videoId?: string, commentId?: string){
    let likedDisliked: Like | null = null;

    if(videoId){
      likedDisliked = await this.likesRepository.findOne({
        where: { user: { user_id: user.user_id }, video: { id: videoId } },
      });
    };
    
    if (commentId) {
      likedDisliked = await this.likesRepository.findOne({
        where: { user: { user_id: user.user_id }, comment: { id: commentId } },
      });
    };

    if (!likedDisliked) throw new NotFoundException('Reaction not found');
    return this.likesRepository.remove(likedDisliked);
  }

  //Count likes/dislikes
    async countLikesDislikes(videoId?: string, commentId?: string) {
    //Search where is like or dislike
    const whereLike = videoId ? { video: { id: videoId }, like: true } : { comment: { id: commentId }, like: true };
    const whereDislike = videoId ? { video: { id: videoId }, like: false } : { comment: { id: commentId }, like: false };

    const likes = await this.likesRepository.count({ where: whereLike });
    const dislikes = await this.likesRepository.count({ where: whereDislike });

    return { likes, dislikes };
  }
} 

