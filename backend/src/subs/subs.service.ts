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
}
