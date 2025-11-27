import { Controller, Post, Delete, Get, Param, ParseUUIDPipe, Body, UseGuards, Req, Query } from '@nestjs/common';
import { SubscriptionsService } from './subs.service';
import { CreateSubscriptionDto } from './dto/create-sub.dto';
import { DeleteSubscriptionDto } from './dto/delete-sub.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) { }

  //Subscribe
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Req() req: any,
  ) {
    const user = await this.subscriptionsService['usersRepository'].findOne({ where: { user_id: req.user.id } });
    if (!user) throw new Error('User not found');
    return this.subscriptionsService.subscribe(user, createSubscriptionDto.channelId);
  }

  //Unsubscribe
  @Delete()
  @UseGuards(AuthGuard('jwt'))
  async remove(
    @Body() deleteSubscriptionDto: DeleteSubscriptionDto,
    @Req() req: any,
  ) {
    const user = await this.subscriptionsService['usersRepository'].findOne({ where: { user_id: req.user.id } });
    if (!user) throw new Error('User not found');
    return this.subscriptionsService.unsubscribe(user, deleteSubscriptionDto.channelId);
  }

  //Get all subscriptions
  @Get('user/:userId')
  findSubscriptionsByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.subscriptionsService.getUserSubscriptions(userId);
  }

  //Get all subscribers
  @Get('channel/:channelId')
  findSubscribersByChannel(
    @Param('channelId', ParseUUIDPipe) channelId: string,
  ) {
    return this.subscriptionsService.getChannelSubscribers(channelId);
  }

  //Get recent subscribers
  @Get('channel/:channelId/recent')
  findRecentSubscribersByChannel(
    @Param('channelId', ParseUUIDPipe) channelId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.subscriptionsService.getRecentSubscribers(channelId, limitNum);
  }

  //Get recent subscribers for logged-in user
  @Get('me/recent')
  @UseGuards(AuthGuard('jwt'))
  findRecentSubscribersForMe(@Req() req: any) {
    const userId = req.user.id;
    return this.subscriptionsService.getRecentSubscribersForLoggedUser(userId);
  }
}