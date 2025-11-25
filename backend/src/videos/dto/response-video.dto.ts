import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ResponseVideoDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsString()
    @IsArray()
    tags: string[];
}