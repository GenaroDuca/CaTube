export interface FriendProfile {
  id: string; 
  username: string;
  status?: 'online' | 'offline';
  avatarUrl?: string; 
}