import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { UsersModule } from './users/users.module'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/user.entity'; 
import { Channel } from './channels/channel.entity';
import { ChannelsModule } from './channels/channels.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { StoreModule } from './store/store.module';
import { Store } from './store/entities/store.entity';
import { Product } from './product/entities/product.entity';
import { Playlist } from './playlist/entities/playlist.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',       
      password: 'Milaneso23',   
      database: 'youtube_db',
      entities: [User, Channel, Store, Product, Playlist],       
      synchronize: true,      
    }),

    UsersModule,

    ChannelsModule,

    AuthModule,

    ProductModule,

    StoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}