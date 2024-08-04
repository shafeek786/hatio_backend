import {
  Body,
  ConflictException,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

/**
 * UsersController handles user-related operations.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Registers a new user.
   * @param user - User registration details.
   * @returns A success message.
   * @throws ConflictException if the user already exists.
   * @throws HttpException for internal server errors.
   */
  @Post('register')
  async register(@Body() user: CreateUserDto): Promise<{ message: string }> {
    try {
      return this.usersService.register(user);
    } catch (err) {
      if (err instanceof ConflictException) {
        throw new HttpException(err.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
