import { IsString, IsEnum } from 'class-validator';
import { TagType } from '../entities/tag.entity';

export class CreateTagDto {
  @IsString()
  name: string;

  @IsEnum(TagType)
  type: TagType;
}