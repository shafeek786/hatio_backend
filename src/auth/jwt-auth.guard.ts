import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends NestAuthGuard('jwt') {
  /**
   * Determines if the request can be activated based on the JWT strategy.
   * @param context The execution context of the request.
   * @returns A boolean, Promise<boolean>, or Observable<boolean> indicating whether the request can be activated.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context) as
      | Observable<boolean>
      | Promise<boolean>
      | boolean;
  }

  /**
   * Handles the result of the authentication process.
   * @param err Error encountered during authentication, if any.
   * @param user The user object if authentication is successful.
   * @param info Additional information about the authentication process.
   * @returns The user object if authentication is successful.
   * @throws UnauthorizedException if authentication fails.
   */
  handleRequest(err, user, info) {
    if (err || !user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
