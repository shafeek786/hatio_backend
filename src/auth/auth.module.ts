import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule, // Provides configuration values
    PassportModule.register({ defaultStrategy: 'jwt' }), // Configures Passport with JWT strategy
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // Connects Mongoose with User schema
    JwtModule.registerAsync({
      imports: [ConfigModule], // Imports ConfigModule for configuration
      inject: [ConfigService], // Injects ConfigService to retrieve configuration values
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Retrieves JWT secret from config
        signOptions: {
          expiresIn: configService.get<string | number>('JWT_EXPIRE'), // JWT expiration time
        },
      }),
    }),
    UsersModule, // Imports UsersModule for user-related operations
  ],
  controllers: [AuthController], // AuthController handles authentication routes
  providers: [AuthService, JwtStrategy], // Provides AuthService and JwtStrategy for authentication logic
  exports: [AuthService], // Exports AuthService for use in other modules
})
export class AuthModule {}
