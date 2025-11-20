
import { IsArray, IsUUID } from 'class-validator';

export class AssignTagsDto {
  @IsUUID()
  video_id: string;

  @IsArray()
  @IsUUID("all", { each: true })
  tag_ids: string[];
}
