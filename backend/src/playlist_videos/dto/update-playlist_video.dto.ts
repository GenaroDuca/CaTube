import { PartialType } from '@nestjs/mapped-types';
import { CreatePlaylistVideoDto } from './create-playlist_video.dto';

export class UpdatePlaylistVideoDto extends PartialType(CreatePlaylistVideoDto) {}
