export class CreateNotificationDto {
    id: string;
    type: string;
    content: string;
    isRead: boolean; 
    linkTarget: string;
    createdAt: string;
    sender: {
        id: string;
        username: string;
        avatarUrl: string | null;
    };
}