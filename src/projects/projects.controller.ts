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
import { ProjectsService } from './projects.service.js';
import { Project } from '../schemas/project.schema';
import { Todo } from '../schemas/todo.schema';
import { CreateProjectDto } from './dto/createProject.dto';
import { AddTodo } from './dto/addTodo.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProject(
    @Body('title') title: CreateProjectDto,
  ): Promise<{ success: boolean; project: Project }> {
    console.log('project');
    return this.projectsService.createProject(title.title);
  }

  @Put('updateproject/:projectId')
  async updateProject(
    @Param('projectId') projectId: string,
    @Body('title') title: string,
  ): Promise<{ success: boolean; project: Project }> {
    return this.projectsService.updateProject(projectId, title);
  }

  @Delete('deleteproject/:projectId')
  async deleteProject(
    @Param('projectId') projectId: string,
  ): Promise<{ success: boolean; projects: Project[] }> {
    return this.projectsService.deleteProject(projectId);
  }

  @Get()
  async getAllProjects(): Promise<{ success: boolean; projects: Project[] }> {
    return this.projectsService.getAllProjects();
  }

  @Get(':id')
  async getProjectById(
    @Param('id') id: string,
  ): Promise<{ success: boolean; project: Project }> {
    return this.projectsService.getProjectById(id);
  }

  @Post(':projectId/todos')
  @HttpCode(HttpStatus.CREATED)
  async addTodoToProject(
    @Param('projectId') projectId: string,
    @Body() data: AddTodo,
  ): Promise<{ success: boolean; todo: Todo }> {
    return this.projectsService.addTodoToProject(projectId, data);
  }

  @Put('todos/:todoId')
  async updateTodoStatus(
    @Param('todoId') todoId: string,
    @Body('status') updateData: { status: boolean },
  ): Promise<{ success: boolean; todo: Todo }> {
    return this.projectsService.updateTodoStatus(todoId, updateData);
  }

  @Put('update/:todoId')
  async updateTodo(
    @Param('todoId') todoId: string,
    @Body() data: AddTodo,
  ): Promise<{ success: boolean; updatedTodo: Todo }> {
    console.log('update');
    return this.projectsService.updateTodo(todoId, data);
  }

  @Delete('todos/:todoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTodoById(
    @Param('todoId') todoId: string,
  ): Promise<{ success: boolean }> {
    return this.projectsService.deleteTodoById(todoId);
  }

  @Get(':projectId/export')
  async exportProjectSummaryToGist(
    @Param('projectId') projectId: string,
  ): Promise<{ success: boolean; gistUrl: string }> {
    return this.projectsService.exportProjectSummaryToGist(projectId);
  }
}
