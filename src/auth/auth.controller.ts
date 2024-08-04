import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Handles user login.
   * @param user Contains email and password.
   * @returns Authentication token or error message.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() user: { email: string; password: string }) {
    const result = await this.authService.validateUser(
      user.email,
      user.password,
    );
    if (result) {
      return this.authService.login(result);
    }
    return { message: 'Invalid credentials' };
  }
}
