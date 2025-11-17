import { DataSource } from 'typeorm';
import * as path from 'path';
// Importa todas tus entidades aquí
import { User } from './src/users/entities/user.entity';
import { Channel } from './src/channels/entities/channel.entity';
import { Store } from './src/store/entities/store.entity';
import { Product } from './src/product/entities/product.entity';
import { Playlist } from './src/playlist/entities/playlist.entity';
import { Video } from './src/videos/entities/video.entity';
import { Comment } from './src/comments/entities/comment.entity';
import { Like } from './src/likes/entities/like.entity';
import { Subscription } from './src/subs/entities/sub.entity';
import { PlaylistVideo } from './src/playlist_videos/entities/playlist_video.entity';
import { Friendship } from './src/friendships/entities/friendship.entity';
import { Notification } from './src/notifications/entities/notification.entity';
import { Post } from './src/posts/entities/post.entity';

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'geniducv1',
    database: 'catube_db',
    
    entities: [
        User, Channel, Store, Product, Playlist, Video,
        Comment, Like, Subscription, PlaylistVideo, Friendship, Notification, Post
    ],
    
    migrations: [path.join(__dirname, 'src', 'migrations', '*.ts')],
    
    synchronize: false,
    logging: true,
});