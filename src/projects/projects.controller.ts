import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Project } from '../schemas/project.schema';
import { Todo } from '../schemas/todo.schema';
import { CreateProjectDto } from './dto/createProject.dto';
import { AddTodo } from './dto/addTodo.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';

/**
 * Controller for managing projects and todos.
 * Routes are protected by JWT authentication.
 */
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * Create a new project for a user.
   * @param userId User ID.
   * @param title Project title.
   * @returns { success: boolean; project: Project }
   */
  @Post('/:userId')
  @HttpCode(HttpStatus.CREATED)
  async createProject(
    @Param('userId') userId: string,
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<{ success: boolean; project: Project }> {
    const { title } = createProjectDto;
    return this.projectsService.createProject(title, userId);
  }

  /**
   * Update an existing project.
   * @param projectId Project ID.
   * @param title New project title.
   * @returns { success: boolean; project: Project }
   */
  @Put('updateproject/:projectId')
  async updateProject(
    @Param('projectId') projectId: string,
    @Body('title') title: string,
  ): Promise<{ success: boolean; project: Project }> {
    return this.projectsService.updateProject(projectId, title);
  }
  @Get('get_deleted/:id')
  async getDetedTodo(@Param('id') id: string): Promise<any> {
    return this.projectsService.getDeletedTodo(id);
  }
  /**
   * Delete a project by ID.
   * @param projectId Project ID.
   * @returns { success: boolean; projects: Project[] }
   */
  @Delete('deleteproject/:projectId')
  async deleteProject(
    @Param('projectId') projectId: string,
  ): Promise<{ success: boolean; projects: Project[] }> {
    return this.projectsService.deleteProject(projectId);
  }

  /**
   * Get all projects for a user.
   * @param id User ID.
   * @returns { success: boolean; projects: Project[] }
   */
  @Get('/:id')
  async getAllProjects(
    @Param('id') id: string,
  ): Promise<{ success: boolean; projects: Project[] }> {
    return this.projectsService.getAllProjects(id);
  }

  /**
   * Get a project by ID.
   * @param id Project ID.
   * @returns { success: boolean; project: Project }
   */
  @Get('projectsbyid/:id')
  async getProjectById(
    @Param('id') id: string,
  ): Promise<{ success: boolean; project: Project }> {
    return this.projectsService.getProjectById(id);
  }

  /**
   * Add a new todo to a project.
   * @param projectId Project ID.
   * @param data Todo details.
   * @returns { success: boolean; todo: Todo }
   */
  @Post(':projectId/todos')
  @HttpCode(HttpStatus.CREATED)
  async addTodoToProject(
    @Param('projectId') projectId: string,
    @Body() data: AddTodo,
  ): Promise<{ success: boolean; todo: Todo }> {
    return this.projectsService.addTodoToProject(projectId, data);
  }

  /**
   * Update the status of a todo.
   * @param todoId Todo ID.
   * @param updateData Status update data.
   * @returns { success: boolean; todo: Todo }
   */
  @Put('todos/:todoId')
  async updateTodoStatus(
    @Param('todoId') todoId: string,
    @Body('status') updateData: { status: boolean },
  ): Promise<{ success: boolean; todo: Todo }> {
    return this.projectsService.updateTodoStatus(todoId, updateData);
  }

  /**
   * Update a todo.
   * @param todoId Todo ID.
   * @param data New todo details.
   * @returns { success: boolean; updatedTodo: Todo }
   */
  @Put('update/:todoId')
  async updateTodo(
    @Param('todoId') todoId: string,
    @Body() data: AddTodo,
  ): Promise<{ success: boolean; updatedTodo: Todo }> {
    return this.projectsService.updateTodo(todoId, data);
  }

  /**
   * Delete a todo by ID.
   * @param todoId Todo ID.
   * @returns { success: boolean }
   */
  @Delete('todos/:todoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTodoById(
    @Param('todoId') todoId: string,
  ): Promise<{ success: boolean }> {
    return this.projectsService.deleteTodoById(todoId);
  }

  /**
   * Export a project's summary to a GitHub Gist.
   * @param projectId Project ID.
   * @returns { success: boolean; gistUrl: string }
   */
  @Get(':projectId/export')
  async exportProjectSummaryToGist(
    @Param('projectId') projectId: string,
  ): Promise<{ success: boolean; gistUrl: string }> {
    return this.projectsService.exportProjectSummaryToGist(projectId);
  }

  @Get('get_deleted_project/:id')
  async getDeletedProject(@Param('id') id: string): Promise<any> {
    return this.projectsService.getAllDeletedProjects(id);
  }
}
