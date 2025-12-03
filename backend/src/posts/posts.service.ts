import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { Subscription } from '../subs/entities/sub.entity';
import { ChannelsService } from '../channels/channels.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>,
    private notificationsService: NotificationsService,
    private channelsRepository: ChannelsService,
  ) { }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    // 1. Crear y guardar el post
    const post = this.postRepository.create(createPostDto);
    const newPost = await this.postRepository.save(post);

    // 2. Notificar a los seguidores
    this.notifyFollowers(newPost);

    return newPost;
  }

  private async notifyFollowers(post: Post): Promise<void> {
    const senderId = post.userId;
    const channelId = post.channelId; 
    const postId = post.id;

    if (!senderId || !channelId) {
      console.error(`ERROR: No se pudo notificar a los seguidores. Faltan userId o channelId en el post ${postId}.`);
      return;
    }

    try {
      const sendingChannel = await this.channelsRepository.findOneById(channelId);

      if (!sendingChannel) {
        console.error(`ERROR: No se encontró el canal con ID ${channelId} para el post ${postId}.`);
        return;
      }

      // 2. Definir el URL de destino una sola vez con la URL del canal remitente
      const linkTarget = `/yourchannel/${sendingChannel.url}`; 

      // 3. Encontrar todas las suscripciones (seguidores) a este canal
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

      // 4. Crear y enviar notificaciones
      const notificationPromises = subscriptions.map(sub => {
        const receiverId = sub.user.user_id;

        if (receiverId === senderId) {
          return Promise.resolve();
        }

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
    if (userId && post.userId && post.userId !== userId) {
      throw new NotFoundException('You can only delete your own posts');
    }
    await this.postRepository.remove(post);
  }


}
