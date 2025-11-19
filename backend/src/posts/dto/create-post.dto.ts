import { IsString, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsString()
  content: string;

  @IsString()
  channelId: string;

  @IsOptional()
  userId?: string;
}
