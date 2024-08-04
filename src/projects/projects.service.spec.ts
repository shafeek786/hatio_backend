import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { Project } from 'src/schemas/project.schema';
import { Todo } from 'src/schemas/todo.schema';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

interface MockTodo extends Todo, Document {
  save: jest.Mock;
}

const mockProjectInstance = {
  save: jest.fn(),
};

const mockProjectModel = {
  create: jest.fn().mockResolvedValue(mockProjectInstance),
  findById: jest.fn(),
  find: jest.fn().mockReturnThis(),
  deleteOne: jest.fn(),
  populate: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

const mockTodoModel = {
  findById: jest.fn(),
  save: jest.fn(),
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectModel: Model<Project>;
  let todoModel: Model<Todo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getModelToken(Project.name), useValue: mockProjectModel },
        { provide: getModelToken(Todo.name), useValue: mockTodoModel },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectModel = module.get<Model<Project>>(getModelToken(Project.name));
    todoModel = module.get<Model<Todo>>(getModelToken(Todo.name));
  });

  describe('createProject', () => {
    it('should throw an InternalServerErrorException if an error occurs', async () => {
      mockProjectInstance.save.mockRejectedValue(new Error('Error'));

      await expect(
        service.createProject('userId123', 'Test Project'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateProject', () => {
    it('should successfully update a project', async () => {
      const project = { title: 'Old Title', _id: '123', save: jest.fn() };
      const updatedProject = { title: 'New Title', _id: '123' };

      (projectModel.findById as jest.Mock).mockResolvedValue(project as any);
      (project.save as jest.Mock).mockResolvedValue(updatedProject as any);

      const result = await service.updateProject('123', 'New Title');
      expect(result).toEqual({ success: true, project: updatedProject });
    });

    it('should throw NotFoundException if project is not found', async () => {
      (projectModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.updateProject('123', 'New Title')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      (projectModel.findById as jest.Mock).mockRejectedValue(
        new Error('Error'),
      );

      await expect(service.updateProject('123', 'New Title')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getAllProjects', () => {
    it('should return all projects', async () => {
      const projects = [{ title: 'Project 1' }, { title: 'Project 2' }];
      (projectModel.find as jest.Mock).mockResolvedValue(projects as any);

      const result = await service.getAllProjects('userId123');
      expect(result).toEqual({ success: true, projects });
    });
  });

  describe('deleteProject', () => {
    it('should successfully delete a project', async () => {
      const projects = [{ title: 'Project 2' }];

      (projectModel.deleteOne as jest.Mock).mockResolvedValue({
        deletedCount: 1,
      } as any);
      (projectModel.find as jest.Mock).mockResolvedValue(projects as any);

      const result = await service.deleteProject('123');
      expect(result).toEqual({ success: true, projects });
    });

    it('should throw NotFoundException if project is not found', async () => {
      (projectModel.deleteOne as jest.Mock).mockResolvedValue({
        deletedCount: 0,
      } as any);

      await expect(service.deleteProject('123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      (projectModel.deleteOne as jest.Mock).mockRejectedValue(
        new Error('Error'),
      );

      await expect(service.deleteProject('123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getProjectById', () => {
    it('should successfully retrieve a project by id', async () => {
      const project = { _id: '123', todos: [] };

      (projectModel.findById as jest.Mock).mockResolvedValue(project as any);

      const result = await service.getProjectById('123');
      expect(result).toEqual({ success: true, project });
    });

    it('should throw NotFoundException if project is not found', async () => {
      (projectModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getProjectById('123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      (projectModel.findById as jest.Mock).mockRejectedValue(
        new Error('Error'),
      );

      await expect(service.getProjectById('123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('addTodoToProject', () => {
    it('should successfully add a todo to a project', async () => {
      const project = { _id: '123', todos: [], save: jest.fn() };
      const newTodo: MockTodo = {
        name: 'Test Todo',
        description: 'Test Description',
        _id: '456',
        save: jest.fn(),
      } as any;

      (projectModel.findById as jest.Mock).mockResolvedValue(project as any);
      (todoModel.findById as jest.Mock).mockResolvedValue(newTodo as any);
      (newTodo.save as jest.Mock).mockResolvedValue(newTodo as any);

      const result = await service.addTodoToProject('123', {
        name: 'Test Todo',
        description: 'Test Description',
      });
      expect(result).toEqual({ success: true, todo: newTodo });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      (projectModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.addTodoToProject('123', {
          name: 'Test Todo',
          description: 'Test Description',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateTodoStatus', () => {
    it('should successfully update a todo status', async () => {
      const todo: MockTodo = {
        _id: '456',
        status: false,
        save: jest.fn(),
      } as any;
      const updatedTodo = { _id: '456', status: true };

      (todoModel.findById as jest.Mock).mockResolvedValue(todo as any);
      (todo.save as jest.Mock).mockResolvedValue(updatedTodo as any);

      const result = await service.updateTodoStatus('456', { status: true });
      expect(result).toEqual({ success: true, todo: updatedTodo });
    });

    it('should throw NotFoundException if todo is not found', async () => {
      (todoModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateTodoStatus('456', { status: true }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      (todoModel.findById as jest.Mock).mockRejectedValue(new Error('Error'));

      await expect(
        service.updateTodoStatus('456', { status: true }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
