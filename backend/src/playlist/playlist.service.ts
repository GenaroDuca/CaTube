import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './entities/playlist.entity';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createPlaylistDto: CreatePlaylistDto,
    userId: string,
  ): Promise<Playlist> {
    // Busca el usuario por su ID
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Crea la playlist asociando el usuario
    const newPlaylist = this.playlistRepository.create({
      ...createPlaylistDto,
      channel: user.channel,
      user: user, // Asocia el usuario a la playlist
    });
    return await this.playlistRepository.save(newPlaylist);
  }

  //  async findAllByUser(userId: number): Promise<Playlist[]> { {
  //   return await this.playlistRepository.find({
  //     where: { userId: { id: userId } },
  //     order: { createdAt: 'DESC' },
  //   });
  // }

  // async findOne(id: number, userId: number): Promise<Playlist>  {
  //   const playlist = await this.playlistRepository.findOne({
  //     where: { id, userId: { id: userId } },
  //   });
  //   if (!playlist) {
  //     throw new NotFoundException(`Playlist with not found`);
  //   }
  //   return playlist;
  // }

  // async update(id: number, userId: number, updatePlaylistDto: UpdatePlaylistDto): Promise<Playlist> {
  //   const playlist = await this.findOne(id, userId);
  //   Object.assign(playlist, updatePlaylistDto);
  //   return await this.playlistRepository.save(playlist);
  // }

  // async remove(id: number, userId: number): Promise<void> {
  //   const playlist = await this.findOne(id, userId);
  //   await this.playlistRepository.remove(playlist);
  // }
}
