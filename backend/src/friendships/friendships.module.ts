import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from './entities/friendship.entity'; 
import { User } from '../users/entities/user.entity'; 

import { FriendshipService } from './friendships.service';
import { FriendshipsController } from './friendships.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friendship, User]), 
  ],
  controllers: [FriendshipsController],
  providers: [FriendshipService],
  exports: [FriendshipService],
})
export class FriendshipsModule {}