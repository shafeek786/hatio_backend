import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
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
