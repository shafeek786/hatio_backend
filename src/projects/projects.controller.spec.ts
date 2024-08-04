import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateProjectDto } from './dto/createProject.dto';
import { AddTodo } from './dto/addTodo.dto';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: {
            createProject: jest
              .fn()
              .mockResolvedValue({ success: true, project: {} }),
            updateProject: jest
              .fn()
              .mockResolvedValue({ success: true, project: {} }),
            deleteProject: jest
              .fn()
              .mockResolvedValue({ success: true, projects: [] }),
            getAllProjects: jest
              .fn()
              .mockResolvedValue({ success: true, projects: [] }),
            getProjectById: jest
              .fn()
              .mockResolvedValue({ success: true, project: {} }),
            addTodoToProject: jest
              .fn()
              .mockResolvedValue({ success: true, todo: {} }),
            updateTodoStatus: jest
              .fn()
              .mockResolvedValue({ success: true, todo: {} }),
            updateTodo: jest
              .fn()
              .mockResolvedValue({ success: true, updatedTodo: {} }),
            deleteTodoById: jest.fn().mockResolvedValue({ success: true }),
            exportProjectSummaryToGist: jest
              .fn()
              .mockResolvedValue({ success: true, gistUrl: '' }),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({})
      .compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a project', async () => {
    const createProjectDto: CreateProjectDto = { title: 'Test Project' };
    const userId = 'testUserId';
    const result = await controller.createProject(userId, createProjectDto);
    expect(result).toEqual({ success: true, project: {} });
    expect(service.createProject).toHaveBeenCalledWith(
      createProjectDto.title,
      userId,
    );
  });

  it('should update a project', async () => {
    const projectId = 'testProjectId';
    const title = 'Updated Title';
    const result = await controller.updateProject(projectId, title);
    expect(result).toEqual({ success: true, project: {} });
    expect(service.updateProject).toHaveBeenCalledWith(projectId, title);
  });

  it('should delete a project', async () => {
    const projectId = 'testProjectId';
    const result = await controller.deleteProject(projectId);
    expect(result).toEqual({ success: true, projects: [] });
    expect(service.deleteProject).toHaveBeenCalledWith(projectId);
  });

  it('should get all projects for a user', async () => {
    const userId = 'testUserId';
    const result = await controller.getAllProjects(userId);
    expect(result).toEqual({ success: true, projects: [] });
    expect(service.getAllProjects).toHaveBeenCalledWith(userId);
  });

  it('should get a project by id', async () => {
    const projectId = 'testProjectId';
    const result = await controller.getProjectById(projectId);
    expect(result).toEqual({ success: true, project: {} });
    expect(service.getProjectById).toHaveBeenCalledWith(projectId);
  });

  it('should add a todo to a project', async () => {
    const projectId = 'testProjectId';
    const addTodoDto: AddTodo = {
      name: 'Test Todo',
      description: 'Test Description',
    };
    const result = await controller.addTodoToProject(projectId, addTodoDto);
    expect(result).toEqual({ success: true, todo: {} });
    expect(service.addTodoToProject).toHaveBeenCalledWith(
      projectId,
      addTodoDto,
    );
  });

  it('should update todo status', async () => {
    const todoId = 'testTodoId';
    const updateData = { status: true };
    const result = await controller.updateTodoStatus(todoId, updateData);
    expect(result).toEqual({ success: true, todo: {} });
    expect(service.updateTodoStatus).toHaveBeenCalledWith(todoId, updateData);
  });

  it('should update a todo', async () => {
    const todoId = 'testTodoId';
    const updateTodoDto: AddTodo = {
      name: 'Updated Title',
      description: 'Updated Description',
    };
    const result = await controller.updateTodo(todoId, updateTodoDto);
    expect(result).toEqual({ success: true, updatedTodo: {} });
    expect(service.updateTodo).toHaveBeenCalledWith(todoId, updateTodoDto);
  });

  it('should delete a todo by id', async () => {
    const todoId = 'testTodoId';
    const result = await controller.deleteTodoById(todoId);
    expect(result).toEqual({ success: true });
    expect(service.deleteTodoById).toHaveBeenCalledWith(todoId);
  });

  it('should export project summary to Gist', async () => {
    const projectId = 'testProjectId';
    const result = await controller.exportProjectSummaryToGist(projectId);
    expect(result).toEqual({ success: true, gistUrl: '' });
    expect(service.exportProjectSummaryToGist).toHaveBeenCalledWith(projectId);
  });
});
