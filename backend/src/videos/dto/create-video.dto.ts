import { IsNotEmpty, IsOptional, IsString, MaxLength, IsArray } from 'class-validator';

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
    @IsArray()
    @IsString({ each: true })
    tag?: string[]; 

    @IsOptional()
    @IsString()
    url?: string;

    @IsOptional()
    @IsString()
    thumbnail?: string;
}
