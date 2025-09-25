import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreatePlaylistDto {
    @IsString()
    @IsNotEmpty()
    playlist_title: string;

    @IsString()
    @IsOptional()
    playlist_description?: string;

    @IsBoolean()
    @IsOptional()
    isPublic?: boolean;
}
