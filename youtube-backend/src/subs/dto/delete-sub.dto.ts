import { IsUUID } from 'class-validator';

export class DeleteSubscriptionDto {
    @IsUUID()
    channelId: string;
}
