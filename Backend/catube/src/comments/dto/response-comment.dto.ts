import { IsNotEmpty, IsString } from 'class-validator';

export class ResponseCommentDto {
    @IsString()
    @IsNotEmpty()
    user_name: string;

    @IsString()
    @IsNotEmpty()
    content: string

    @IsNotEmpty()
    @IsString()
    createdAt: Date;
}