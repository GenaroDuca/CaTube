import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postRepository.create(createPostDto);
    return await this.postRepository.save(post);
  }

  async findAllByChannel(channelId: string): Promise<Post[]> {
    return await this.postRepository.find({
      where: { channelId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    Object.assign(post, updatePostDto);
    return await this.postRepository.save(post);
  }

  async remove(id: number, userId?: string): Promise<void> {
    const post = await this.findOne(id);
    // Allow deletion if userId is not provided (for channel owners) or if it matches the post's userId
    if (userId && post.userId && post.userId !== userId) {
      throw new NotFoundException('You can only delete your own posts');
    }
    await this.postRepository.remove(post);
  }


}
