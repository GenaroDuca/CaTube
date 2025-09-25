import { Controller, Post, Delete, Get, Param, ParseUUIDPipe, Body, UseGuards, Req } from '@nestjs/common';
import { SubscriptionsService } from './subs.service';
import { CreateSubscriptionDto } from './dto/create-sub.dto';
import { DeleteSubscriptionDto } from './dto/delete-sub.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  //Subscribe
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Req() req: any,
  ) {
    return this.subscriptionsService.subscribe(req.user, createSubscriptionDto.channelId);
  }

  //Unsubscribe
  @Delete()
  @UseGuards(AuthGuard('jwt'))
  remove(
    @Body() deleteSubscriptionDto: DeleteSubscriptionDto,
    @Req() req: any,
  ) {
    return this.subscriptionsService.unsubscribe(req.user, deleteSubscriptionDto.channelId);
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
}
