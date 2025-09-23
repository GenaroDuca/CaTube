import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subs.service';
import { SubscriptionsController } from './subs.controller';
import { Subscription } from './entities/sub.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, Channel]), UsersModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}
