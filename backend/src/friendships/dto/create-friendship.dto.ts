import { IsNotEmpty, IsUUID, IsString } from 'class-validator';

export class CreateFriendshipDto {

    @IsNotEmpty({ message: 'Receiver ID cannot be empty.' })
    @IsString({ message: 'Receiver ID must be a string.' })
    receiverId: string;
}