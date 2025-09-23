import { IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
    @IsUUID()
    channelId: string;
}

