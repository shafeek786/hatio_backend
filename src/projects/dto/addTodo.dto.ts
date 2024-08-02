import { IsString } from 'class-validator';

export class AddTodo {
  @IsString()
  name: string;

  @IsString()
  description: string;
}
