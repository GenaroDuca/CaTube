import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './entities/playlist.entity';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createPlaylistDto: CreatePlaylistDto, userId: string): Promise<Playlist> {
    const user = await this.userRepository.findOne({ 
      where: { user_id: userId },
      relations: ['channel'] 
    });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const newPlaylist = this.playlistRepository.create({
      ...createPlaylistDto,
      channel: user.channel,
      user: user,
    });
    
    return await this.playlistRepository.save(newPlaylist);
  }

  async findAllByUser(userId: string): Promise<Playlist[]> {
    return await this.playlistRepository.find({
      where: { user: { user_id: userId } },
      relations: ['user', 'channel', 'playlistVideos'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Playlist> {
    const playlist = await this.playlistRepository.findOne({
      where: { playlist_id: id, user: { user_id: userId } },
      relations: ['user', 'channel', 'playlistVideos'],
    });
    
    if (!playlist) {
      throw new NotFoundException('Playlist no encontrada');
    }
    return playlist;
  }

  async update(id: string, userId: string, updatePlaylistDto: UpdatePlaylistDto): Promise<Playlist> {
    const playlist = await this.findOne(id, userId);
    Object.assign(playlist, updatePlaylistDto);
    return await this.playlistRepository.save(playlist);
  }

  async remove(id: string, userId: string): Promise<void> {
    const playlist = await this.findOne(id, userId);
    await this.playlistRepository.remove(playlist);
  }
}