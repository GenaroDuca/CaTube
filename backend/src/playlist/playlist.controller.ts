import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('playlist')
@UseGuards(JwtAuthGuard)
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

   @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createPlaylistDto: CreatePlaylistDto, @Request() req) {
      const userId = req.user.id; // Tomamos el ID del usuario desde el token
      return this.playlistService.create(createPlaylistDto, userId);
    }

  // @Get()
  // findAll(@Request() req){
  //   return this.playlistService.findAll(req.user.id);
  // }

  // @Get(':id')
  // findOne(@Request() req, @Param('id') id: number) {
  //   return this.playlistService.findOne(id, req.user.id);
  // }

  // @Patch(':id')
  // update(@Request() req, @Param('id') id: number, @Body() updatePlaylistDto: UpdatePlaylistDto) {
  //   return this.playlistService.update(id, req.user.id, updatePlaylistDto);
  // }

  // @Delete(':id')
  // remove(@Request() req, @Param('id') id: number) {
  //   return this.playlistService.remove(id, req.user.id);
  // }
}
