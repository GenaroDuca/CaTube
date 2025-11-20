import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class ResponseCommentDto {

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsString()
    createdAt: string;

    @IsOptional()
    @IsString()
    updatedAt?: string;

    @IsNotEmpty()
    @IsNumber()
    likesCount: number;

    @IsOptional()
    replies?: ResponseCommentDto[];
}
