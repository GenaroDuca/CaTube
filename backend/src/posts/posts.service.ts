import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { Subscription } from '../subs/entities/sub.entity'; // Ajusta la ruta si es necesario

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>,
    private notificationsService: NotificationsService,
  ) { }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    // 1. Crear y guardar el post
    const post = this.postRepository.create(createPostDto);
    const newPost = await this.postRepository.save(post);

    // 2. Notificar a los seguidores
    // NOTA: Asumimos que createPostDto incluye 'userId' y 'channelId'
    this.notifyFollowers(newPost);

    return newPost;
  }

  private async notifyFollowers(post: Post): Promise<void> {
    // Necesitas el ID del dueño del canal (senderId)
    const senderId = post.userId;
    const channelId = post.channelId;
    const postId = post.id;

    if (!senderId || !channelId) {
      console.error(`ERROR: No se pudo notificar a los seguidores. Faltan userId o channelId en el post ${postId}.`);
      return;
    }

    try {
      // 1. Encontrar todas las suscripciones (seguidores) a este canal
      const subscriptions = await this.subscriptionsRepository.find({
        where: {
          channel: { channel_id: channelId }
        },
        relations: ['user'],
      });

      if (subscriptions.length === 0) {
        console.log(`Post ${postId}: No hay seguidores para notificar.`);
        return;
      }

      // 2. Crear y enviar notificaciones
      const notificationPromises = subscriptions.map(sub => {
        const receiverId = sub.user.user_id;

        // Opcional: No auto-notificar al dueño del post
        if (receiverId === senderId) {
          return Promise.resolve();
        }

        const linkTarget = `/yourchannel/${channelId}`;
        const notificationContent = `posted a new post "${post.content.substring(0, 30)}..."`;

        return this.notificationsService.createNotification(
          receiverId, 
          senderId,  
          NotificationType.NEW_POST,
          notificationContent,
          linkTarget
        );
      }); 

      await Promise.all(notificationPromises);
      console.log(`Post ${postId}: ${notificationPromises.length} seguidores notificados.`);

    } catch (error) {
      console.error(`ERROR: Falló el envío de notificaciones para el post ${postId}`, error);
    }
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
