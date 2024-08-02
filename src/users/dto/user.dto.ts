import { IsEmail, IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';

export class user {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
  a;

  @IsPhoneNumber(null)
  @IsNotEmpty()
  mobile: number;
}
