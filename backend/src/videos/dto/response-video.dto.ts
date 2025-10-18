import { IsArray, IsNotEmpty, IsString }from 'class-validator';

export class ResponseVideoDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsString()
    @IsArray()
    tags: string[];
}