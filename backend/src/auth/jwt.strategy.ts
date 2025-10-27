// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Define la interfaz del payload (para seguridad de tipos)
interface JwtPayload {
  username: string;
  sub: number; // user_id
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'angelgenajerethiagocatubeproyecto',
    });
  }

  async validate(payload: JwtPayload) {
    return { id: payload.sub };
  }
}