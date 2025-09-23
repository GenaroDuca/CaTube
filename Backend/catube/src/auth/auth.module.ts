import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module'; 
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module'; 

@Module({
  imports: [
    UsersModule, 
    PassportModule,
    JwtModule.register({
      secret: 'angelgenajerethiagocatubeproyecto',
      signOptions: { expiresIn: '1h' }, 
    }),
  ],
  providers: [AuthService], 
  controllers: [AuthController],
})
export class AuthModule {}
