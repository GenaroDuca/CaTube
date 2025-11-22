import { DataSource } from 'typeorm';
import * as path from 'path';

import { User } from './src/users/entities/user.entity';
import { Channel } from './src/channels/entities/channel.entity';
import { Store } from './src/store/entities/store.entity';
import { Product } from './src/product/entities/product.entity';
import { Video } from './src/videos/entities/video.entity';
import { Comment } from './src/comments/entities/comment.entity';
import { Like } from './src/likes/entities/like.entity';
import { Subscription } from './src/subs/entities/sub.entity';
import { Friendship } from './src/friendships/entities/friendship.entity';
import { Notification } from './src/notifications/entities/notification.entity';
import { Post } from './src/posts/entities/post.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? "",
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASS ?? '',
  database: process.env.DB_NAME ?? 'test',
  entities: [
    User, Channel, Store, Product, Video,
    Comment, Like, Subscription, Friendship, Notification, Post
  ],
  migrations: [path.join(__dirname, 'src', 'migrations', '*.ts')],
  synchronize: false,
  logging: true,
});