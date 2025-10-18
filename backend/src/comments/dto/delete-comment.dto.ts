import { IsUUID } from "class-validator";

export class DeleteCommentDto {
    @IsUUID('4')
    id: string;
}