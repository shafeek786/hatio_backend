import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Find a user by their ID.
   * @param id - The ID of the user to find.
   * @returns The user if found, otherwise null.
   */
  async findOneById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  /**
   * Register a new user.
   * @param user - Data Transfer Object containing user details.
   * @returns An object indicating the success or failure of the registration.
   * @throws ConflictException if a user with the same email or mobile already exists.
   */
  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ message: string; success: boolean }> {
    const { email, mobile } = createUserDto;

    // Check if a user with the same email or mobile already exists
    const existingUser = await this.userModel
      .findOne({ $or: [{ email }, { mobile }] })
      .exec();

    if (existingUser) {
      throw new ConflictException('Email or mobile number already exists');
    }

    // Create and save the new user
    await this.userModel.create(createUserDto);

    return { message: 'User registered successfully', success: true };
  }
}
