import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module'; 
import { User } from './users/entities/user.entity'; 
import { Channel } from './channels/entities/channel.entity';
import { ChannelsModule } from './channels/channels.module';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',       
      password: '4215',   
      database: 'catube',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],      
      synchronize: true,      
    }),
    UsersModule,
    ChannelsModule,
    AuthModule,
    CommentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
