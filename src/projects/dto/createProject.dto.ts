import { IsString } from 'class-validator';

/**
 * DTO for creating a new project.
 */
export class CreateProjectDto {
  @IsString()
  title: string; // The title of the project
}
