import { Controller, Post, Body, Get, Param, Patch, Delete, ParseUUIDPipe, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';


@Controller('videos/:videoId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  //Create a new comment for a specific video
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Param('videoId', ParseUUIDPipe) videoId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: any,
  ) {
    const user = req.user as User; // Ensure req.user is typed as User
    return this.commentsService.create(createCommentDto, user, videoId);
  }

  //Get all comments for a specific video
  @Get()
  findAll(@Param('videoId', ParseUUIDPipe) videoId: string) {
    return this.commentsService.findAll(videoId);
  }

  //Update a comment by its ID
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: any,
  ) {
    const user = req.user as User;
    return this.commentsService.update(id, updateCommentDto, user);
  }

  //Delete a comment by its ID
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ){
    const user = req.user as User;
    return this.commentsService.remove(id, user);
  }
}

