import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates a user's credentials by checking email and password.
   * @param email The user's email address.
   * @param password The user's password.
   * @returns User data without the password if credentials are valid.
   * @throws UnauthorizedException if email or password is incorrect.
   */
  async validateUser(email: string, password: string): Promise<any> {
    // Find user by email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email address');
    }

    // Check if password matches
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    // Exclude password from the returned user object
    const { password: _, ...result } = user.toObject();
    return result;
  }

  /**
   * Generates a JWT token for the authenticated user.
   * @param user The user object containing user information.
   * @returns An object containing the access token.
   */
  async login(user: any) {
    // Create JWT payload
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      sub: user._id, // The subject claim
    };

    // Return the JWT token
    return {
      success: true,
      access_token: this.jwtService.sign(payload),
    };
  }
}
