import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  // Mock UsersService
  const mockUsersService = {
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('register', () => {
    it('should return a success message when registration is successful', async () => {
      const newUser: CreateUserDto = {
        email: 'newuser@example.com',
        mobile: 9876543215,
        name: 'New User',
        password: 'password',
      };

      mockUsersService.register.mockResolvedValue({
        message: 'user registered successfully',
      });

      const result = await usersController.register(newUser);
      expect(result).toEqual({ message: 'user registered successfully' });
      expect(mockUsersService.register).toHaveBeenCalledWith(newUser);
    });

    it('should throw ConflictException when email or mobile already exists', async () => {
      const existingUser: CreateUserDto = {
        email: 'existing@example.com',
        mobile: 1234567890,
        name: 'Existing User',
        password: 'password',
      };

      mockUsersService.register.mockRejectedValue(
        new ConflictException('email id or mobile number already exist'),
      );

      await expect(usersController.register(existingUser)).rejects.toThrow(
        new HttpException(
          'email id or mobile number already exist',
          HttpStatus.CONFLICT,
        ),
      );
    });

    it('should throw HttpException for internal server errors', async () => {
      const newUser: CreateUserDto = {
        email: 'newuser@example.com',
        mobile: 9876543215,
        name: 'New User',
        password: 'password',
      };

      mockUsersService.register.mockRejectedValue(
        new Error('internal server error'),
      );

      await expect(usersController.register(newUser)).rejects.toThrow(
        new HttpException(
          'internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
