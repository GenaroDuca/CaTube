import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { UsersModule } from './users/users.module'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/user.entity'; 
import { Channel } from './channels/channel.entity';
import { ChannelsModule } from './channels/channels.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',       
      password: 'Colo123',   
      database: 'youtube_db',
      entities: [User, Channel],       
      synchronize: true,      
    }),

    UsersModule,

    ChannelsModule,

    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}