import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<User>;

  // Mock data
  const mockUser = {
    _id: '1',
    email: 'test@example.com',
    mobile: 1234567890,
    save: jest.fn().mockResolvedValue({
      _id: '1',
      email: 'test@example.com',
      mobile: 1234567890,
    }),
  };

  const mockModel = {
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    create: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneById', () => {
    it('should return null if no user is found by id', async () => {
      const result = await service.findOneById('1');
      expect(result).toBeNull();
      expect(model.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const newUser: CreateUserDto = {
        // Updated to match DTO name
        email: 'newuser@example.com',
        mobile: 9876543215,
        name: 'New User',
        password: 'password123',
      };

      // Mock `findOne` to return null indicating no user exists with this email or mobile
      mockModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Mock `create` to return the created user
      mockModel.create = jest.fn().mockResolvedValue(mockUser);

      const result = await service.register(newUser);
      expect(result).toEqual({
        message: 'User registered successfully',
        success: true,
      });
      expect(model.findOne).toHaveBeenCalledWith({
        $or: [{ email: newUser.email }, { mobile: newUser.mobile }],
      });
      expect(model.create).toHaveBeenCalledWith(newUser);
    });

    it('should throw ConflictException if email or mobile already exists', async () => {
      const existingUser: CreateUserDto = {
        // Updated to match DTO name
        email: 'existing@example.com',
        mobile: 1234567890,
        name: 'Existing User',
        password: 'password123',
      };

      // Mock `findOne` to return an existing user indicating a conflict
      mockModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingUser),
      });

      await expect(service.register(existingUser)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
