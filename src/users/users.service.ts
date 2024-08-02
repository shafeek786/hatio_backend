import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { user } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOneById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async register(user: user): Promise<{ message: string; success: boolean }> {
    const { email, mobile } = user;
    console.log(email);
    const existingUser = await this.userModel
      .findOne({ $or: [{ email }, { mobile }] })
      .exec();
    console.log('log');
    if (existingUser) {
      console.log('log');
      throw new ConflictException('email id or mobile number already exist');
    }
    console.log('log 2');
    const userCreated = new this.userModel(user);
    await userCreated.save();

    return { message: 'user registered successfully', success: true };
  }
}
