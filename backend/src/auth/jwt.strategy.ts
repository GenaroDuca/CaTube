import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'angelgenajerethiagocatubeproyecto', // ¡IMPORTANTE! Usa la misma clave secreta que en auth.module.ts
    });
  }

  async validate(payload: any) {
    // El payload es lo que pusimos en el método login(): { username: '...', sub: ... }
    // Passport lo adjuntará a request.user
    return { userId: payload.sub, username: payload.username };
  }
}
