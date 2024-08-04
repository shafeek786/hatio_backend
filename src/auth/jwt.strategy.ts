import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Ensures that expired tokens are not accepted
      secretOrKey: process.env.JWT_SECRET, // Secret key for verifying JWTs
    });
  }

  /**
   * Validates the JWT payload by fetching the user from the UsersService.
   * @param payload The JWT payload containing user information.
   * @returns The user object if found, otherwise null.
   */
  async validate(payload: any) {
    const user = await this.usersService.findOneById(payload.sub);
    return user; // Returns the user object if found
  }
}
