
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/sub.entity';
import { User } from 'src/users/entities/user.entity';
import { Channel } from 'src/channels/entities/channel.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>,
  ) {}

  //Subscribe
    async subscribe(user: User, channelId: string) {
    const channel = await this.channelsRepository.findOne({
      where: { channel_id: channelId },
    });

    if (!channel) throw new NotFoundException('Channel not found');

    //Subscribed?
    const subscribed = await this.subscriptionsRepository.findOne({
      where: { user: { user_id: user.user_id }, channel: { channel_id: channelId } },
    });

    if (subscribed) {
      throw new BadRequestException('You are already subscribed to this channel');
    }

    const subscription = this.subscriptionsRepository.create({
      user,
      channel,
    });

    await this.subscriptionsRepository.save(subscription);

    // Increment subscriber count
    await this.channelsRepository.increment({ channel_id: channelId }, 'subscriberCount', 1);

    return subscription;
  }

  //Unsubscribe
  async unsubscribe(user: User, channelId: string) {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { user: { user_id: user.user_id }, channel: { channel_id: channelId } },
    });

    if (!subscription) throw new NotFoundException('Subscription not found');

    const channel = await this.channelsRepository.findOne({
      where: { channel_id: channelId },
    });

    if (!channel) throw new NotFoundException('Channel not found');

    await this.subscriptionsRepository.remove(subscription);

    // Decrement subscriber count
    await this.channelsRepository.decrement({ channel_id: channelId }, 'subscriberCount', 1);

    return subscription;
  }

  //Get all subscriptions
  async getUserSubscriptions(userId: string) {
    const subscriptions = await this.subscriptionsRepository.find({
      where: { user: { user_id: userId } },
      relations: ['channel'],
    });

    return subscriptions.map((sub) => sub.channel);
  }

  //Get all subscribers
  async getChannelSubscribers(channelId: string) {
    const channel = await this.channelsRepository.findOne({
      where: { channel_id: channelId },
      relations: ['subscribers', 'subscribers.user'],
    });

    if (!channel) throw new NotFoundException('Channel not found');

    return channel.subscribers.map((sub) => sub.user);
  }

  //Get recent subscribers with their channel data
  async getRecentSubscribers(channelId: string, limit: number = 10) {
    const channel = await this.channelsRepository.findOne({
      where: { channel_id: channelId },
    });

    if (!channel) throw new NotFoundException('Channel not found');

    const recentSubs = await this.subscriptionsRepository.find({
      where: { channel: { channel_id: channelId } },
      relations: ['user', 'user.channel'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return recentSubs.map((sub) => ({
      id: sub.user.user_id,
      username: sub.user.username,
      channel: sub.user.channel ? {
        channel_id: sub.user.channel.channel_id,
        channel_name: sub.user.channel.channel_name,
        photoUrl: sub.user.channel.photoUrl,
        subscriberCount: sub.user.channel.subscriberCount,
      } : null,
      subscribedAt: sub.createdAt,
    }));
  }

  //Get recent subscribers of the logged-in user's channel
  async getRecentSubscribersForLoggedUser(userId: string, limit: number = 10) {
    const user = await this.usersRepository.findOne({
      where: { user_id: userId },
      relations: ['channel'],
    });

    if (!user || !user.channel) throw new NotFoundException('User or channel not found');

    return this.getRecentSubscribers(user.channel.channel_id, limit);
  }
}
