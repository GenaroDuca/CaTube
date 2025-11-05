import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateVideoDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    title?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsString()
    thumbnail?: string;
}
