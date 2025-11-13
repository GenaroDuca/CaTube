import { IsInt, IsArray, IsString } from 'class-validator';

export class AssignTagsDto {
  @IsInt()
  video_id: string;

  @IsArray()
  @IsString({ each: true })
  tagNames: string[];
}