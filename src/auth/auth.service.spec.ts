import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userModel: Model<User>;
  let usersService: UsersService;

  const mockUserModel = {
    findOne: jest.fn(),
  };

  const mockUsersService = {};

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockToken'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user details without password on successful validation', async () => {
      const user = {
        _id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        toObject: jest.fn().mockReturnValue({
          _id: '1',
          email: 'test@example.com',
          password: 'hashedPassword',
          name: 'Test User',
        }),
      };
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      mockUserModel.findOne = jest.fn().mockResolvedValue(user);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual({
        _id: '1',
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should throw UnauthorizedException if email is invalid', async () => {
      mockUserModel.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        service.validateUser('invalid@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const user = {
        _id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        toObject: jest.fn().mockReturnValue({
          _id: '1',
          email: 'test@example.com',
          password: 'hashedPassword',
          name: 'Test User',
        }),
      };
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
      mockUserModel.findOne = jest.fn().mockResolvedValue(user);

      await expect(
        service.validateUser('test@example.com', 'wrongPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return a JWT token on successful login', async () => {
      const user = {
        _id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      const result = await service.login(user);
      expect(result).toEqual({ access_token: 'mockToken', success: true });
      expect(jwtService.sign).toHaveBeenCalledWith({
        name: user.name,
        email: user.email,
        sub: user._id,
        id: user._id,
      });
    });
  });
});
