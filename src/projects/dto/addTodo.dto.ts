import { IsString } from 'class-validator';

/**
 * DTO for adding a new todo item.
 */
export class AddTodo {
  @IsString()
  name: string; // The name of the todo item

  @IsString()
  description: string; // A description of the todo item
}
