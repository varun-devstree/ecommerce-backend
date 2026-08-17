import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { ERROR_MESSAGES } from '../../../common/constants';

export interface JwtPayload {
  sub: number | string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'super_secret_social_media_key_12345',
      ),
    });
  }

  async validate(payload: JwtPayload) {
    const userId = Number(payload.sub);
    if (!payload.sub || Number.isNaN(userId) || !Number.isInteger(userId)) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTH.UNAUTHORIZED_OR_INVALID_TOKEN,
      );
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTH.UNAUTHORIZED_OR_INVALID_TOKEN,
      );
    }
    return user;
  }
}
