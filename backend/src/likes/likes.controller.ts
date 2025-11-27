import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseUUIDPipe, ParseBoolPipe, Query } from '@nestjs/common';
import { LikesService } from './likes.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('likes')
export class LikesController {
    constructor(private readonly likesService: LikesService) { }

    //VIDEO REACTIONS
    @Post('video/:videoId')
    @UseGuards(AuthGuard('jwt'))
    reactVideo(
        @Param('videoId', ParseUUIDPipe) videoId: string,
        @Body('like', ParseBoolPipe) like: boolean,
        @Req() req: any,
    ) {
        return this.likesService.react(req.user, like, videoId, null);
    }

    @Get('video/:videoId')
    getVideoLikes(@Param('videoId', ParseUUIDPipe) videoId: string) {
        return this.likesService.countLikesDislikes(videoId, null);
    }

    @Patch('video/:videoId')
    @UseGuards(AuthGuard('jwt'))
    updateVideoLike(
        @Param('videoId', ParseUUIDPipe) videoId: string,
        @Body('like', ParseBoolPipe) like: boolean,
        @Req() req: any,
    ) {
        return this.likesService.react(req.user, like, videoId, null);
    }

    @Delete('video/:videoId')
    @UseGuards(AuthGuard('jwt'))
    removeVideoLike(
        @Param('videoId', ParseUUIDPipe) videoId: string,
        @Req() req: any,
    ) {
        return this.likesService.removeReact(req.user, videoId, null);
    }

    //COMMENT REACTIONS 
    @Post('comment/:commentId')
    @UseGuards(AuthGuard('jwt'))
    reactComment(
        @Param('commentId', ParseUUIDPipe) commentId: string,
        @Body('like', ParseBoolPipe) like: boolean,
        @Req() req: any,
    ) {
        return this.likesService.react(req.user, like, null, commentId);
    }

    @Get('comment/:commentId')
    getCommentLikes(@Param('commentId', ParseUUIDPipe) commentId: string) {
        return this.likesService.countLikesDislikes(null, commentId);
    }

    @Patch('comment/:commentId')
    @UseGuards(AuthGuard('jwt'))
    updateCommentLike(
        @Param('commentId', ParseUUIDPipe) commentId: string,
        @Body('like', ParseBoolPipe) like: boolean,
        @Req() req: any,
    ) {
        return this.likesService.react(req.user, like, null, commentId);
    }

    @Delete('comment/:commentId')
    @UseGuards(AuthGuard('jwt'))
    removeCommentLike(
        @Param('commentId', ParseUUIDPipe) commentId: string,
        @Req() req: any,
    ) {
        return this.likesService.removeReact(req.user, null, commentId);
    }

    @Get('user/recent')
    @UseGuards(AuthGuard('jwt'))
    getRecentLikesOnUserVideos(@Req() req: any, @Query('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.likesService.getRecentLikesOnUserVideos(req.user.user_id, limitNum);
    }
}

