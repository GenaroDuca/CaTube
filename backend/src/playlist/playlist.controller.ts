import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('playlists')
@UseGuards(JwtAuthGuard)
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  create(@Body() createPlaylistDto: CreatePlaylistDto, @Request() req) {
    const userId = req.user.userId;
    return this.playlistService.create(createPlaylistDto, userId);
  }

  @Get()
  findAll(@Request() req) {
    const userId = req.user.userId;
    return this.playlistService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.playlistService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Request() req, 
    @Param('id') id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto
  ) {
    const userId = req.user.userId;
    return this.playlistService.update(id, userId, updatePlaylistDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.playlistService.remove(id, userId);
  }
}