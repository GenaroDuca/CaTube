export class CreateNotificationDto {
    notification_id: string;
    type: string;
    content: string;
    isRead: boolean; 
    linkTarget: string;
    createdAt: string;
    sender: {
        senderId: string | null;
        username: string;
        avatarUrl: string | null;
    };
}