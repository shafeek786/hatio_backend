import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { Todo, TodoSchema } from '../schemas/todo.schema';

/**
 * Module for managing projects and todos.
 * Imports the Mongoose module with schemas for Project and Todo,
 * and provides the ProjectsService and ProjectsController.
 */
@Module({
  imports: [
    // Import MongooseModule and register schemas for Project and Todo
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Todo.name, schema: TodoSchema },
    ]),
  ],
  controllers: [ProjectsController], // Register the controller
  providers: [ProjectsService], // Register the service
})
export class ProjectsModule {}
