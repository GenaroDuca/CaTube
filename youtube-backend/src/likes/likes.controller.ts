import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseUUIDPipe, ParseBoolPipe } from '@nestjs/common';
import { LikesService } from './likes.service';
import { AuthGuard } from '@nestjs/passport';


@Controller('likes')
export class LikesController {
    constructor(
        private readonly likesService: LikesService
    ) {}

    @Post(':videoId/:commentId?')
    @UseGuards(AuthGuard('jwt'))
    react(
        @Param('videoId', ParseUUIDPipe) videoId: string,
        @Body('like', ParseBoolPipe) like: boolean,
        @Req() req: any,
        @Param('commentId', ParseUUIDPipe) commentId?: string,
    ){
        return this.likesService.react(req.user, like, videoId, commentId)
    }

    @Get(':videoId/:commentId?')
    getLikes(
        @Param('videoId', ParseUUIDPipe) videoId: string,
        @Param('commentId', ParseUUIDPipe) commentId: string,
    ){
        return this.likesService.countLikesDislikes(videoId, commentId);
    }

    @Patch(':videoId/:commentId?')
    @UseGuards(AuthGuard('jwt'))
    updateLike(
        @Param('videoId', ParseUUIDPipe) videoId: string,
        @Body('like', ParseBoolPipe) like: boolean,
        @Req() req: any,
        @Param('commentId', ParseUUIDPipe) commentId?: string,
    ){
        return this.likesService.react(req.user, like, videoId, commentId)
    }

    @Delete(':videoId/:commentId?')
    @UseGuards(AuthGuard('jwt'))
    remove(
        @Param('videoId', ParseUUIDPipe) videoId: string,
        @Req() req: any,
        @Param('commentId', ParseUUIDPipe) commentId?: string,
    ) {
        return this.likesService.removeReact(req.user, videoId, commentId);
    }
}
