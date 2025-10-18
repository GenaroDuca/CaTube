import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateVideoDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    title: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    description: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    tags?: string[];

    // @IsString()
    // @IsUUID()
    // thumbnailId?: string;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    channelId: string;
}
