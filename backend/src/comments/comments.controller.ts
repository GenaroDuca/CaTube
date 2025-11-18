import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../users/entities/user.entity';
import { Request } from 'express';

@Controller('comment')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  // Create a new comment for a specific video
  @Post(':videoId/comments')
  @UseGuards(AuthGuard('jwt'))
  create(
    @Param('videoId', ParseUUIDPipe) videoId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ) {

    const user = req.user as User;
    const userId = user.user_id;

    return this.commentsService.create(createCommentDto, userId, videoId);
  }

  // Get all comments for a specific video
  @Get(':videoId/comments')
  findAll(
    @Param('videoId', ParseUUIDPipe) videoId: string,
  ) {
    return this.commentsService.findAll(videoId);
  }

  // Update a comment by its ID
  @Patch(':videoId/comments/:id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id', ParseUUIDPipe) commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.commentsService.update(commentId, updateCommentDto, user);
  }


  // Delete a comment by its ID
  @Delete(':videoId/comments/:id')
  @UseGuards(AuthGuard('jwt'))
  remove(
    @Param('id', ParseUUIDPipe) commentId: string,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.commentsService.remove(commentId, user);
  }
}
