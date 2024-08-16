import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from 'src/schemas/project.schema';
import { Todo } from 'src/schemas/todo.schema';
import { AddTodo } from './dto/addTodo.dto';
import axios from 'axios';
import { promises as fs } from 'fs';
import { query } from 'express';

/**
 * Service for managing projects and todos.
 * Provides methods for creating, updating, retrieving, deleting projects and todos,
 * and exporting project summaries to GitHub Gists.
 */
@Injectable()
export class ProjectsService {
  private readonly gistUrl: string = 'https://api.github.com/gists';

  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(Todo.name) private readonly todoModel: Model<Todo>,
  ) {}

  /**
   * Creates a new project.
   * @param title - Title of the project
   * @param userId - ID of the user creating the project
   * @returns Success status and created project
   */
  async createProject(
    title: string,
    userId: string,
  ): Promise<{ success: boolean; project: Project }> {
    try {
      const project = new this.projectModel({ title, user: userId });
      const result = await project.save();
      return { success: true, project: result };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  /**
   * Updates the title of an existing project.
   * @param projectId - ID of the project to update
   * @param title - New title of the project
   * @returns Success status and updated project
   */
  async updateProject(
    projectId: string,
    title: string,
  ): Promise<{ success: boolean; project: Project }> {
    try {
      const project = await this.projectModel.findById(projectId);
      if (!project) {
        throw new NotFoundException('Project not found');
      }
      project.title = title;
      const updatedProject = await project.save();
      return { success: true, project: updatedProject };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating project: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves all projects for a specific user.
   * @param userId - ID of the user
   * @returns Success status and list of projects
   */
  async getAllProjects(
    userId: string,
  ): Promise<{ success: boolean; projects: Project[] }> {
    try {
      const query = { user: userId, isDeleted: false };
      const projects = await this.projectModel
        .find(query)
        .populate('todos')
        .sort({ createdDate: -1 })
        .exec();
      return { success: true, projects: projects };
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving projects');
    }
  }

  async getAllDeletedProjects(
    userId: string,
  ): Promise<{ success: boolean; projects: Project[] }> {
    try {
      const query = { user: userId, isDeleted: true };
      const projects = await this.projectModel
        .find(query)
        .populate('todos')
        .sort({ createdDate: -1 })
        .exec();
      return { success: true, projects: projects };
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving projects');
    }
  }
  /**
   * Deletes a project by its ID.
   * @param id - ID of the project to delete
   * @returns Success status and remaining projects
   */
  async deleteProject(
    id: string,
  ): Promise<{ success: boolean; projects: Project[] }> {
    try {
      const result = await this.projectModel
        .updateOne({ _id: id }, { isDeleted: true })
        .exec();
      // if (result.deletedCount === 0) {
      //   throw new NotFoundException('Project not found');
      // }
      const projects = await this.projectModel
        .find({ isDeleted: false })
        .exec();
      return { success: true, projects };
    } catch (error) {
      throw new InternalServerErrorException('Error deleting project');
    }
  }

  /**
   * Retrieves a single project by its ID.
   * @param id - ID of the project to retrieve
   * @returns Success status and project details
   */
  async getProjectById(
    id: string,
  ): Promise<{ success: boolean; project: Project }> {
    try {
      const project = await this.projectModel
        .findById(id)
        .populate({
          path: 'todos',
          options: { sort: { createdDate: -1 } },
        })
        .exec();
      if (!project) {
        throw new NotFoundException('Project not found');
      }
      return { success: true, project };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Error retrieving project');
      }
    }
  }

  /**
   * Adds a new todo to a project.
   * @param projectId - ID of the project to add the todo to
   * @param data - Data for the new todo
   * @returns Success status and the newly created todo
   */
  async addTodoToProject(
    projectId: string,
    data: AddTodo,
  ): Promise<{ success: boolean; todo: Todo }> {
    try {
      const { name, description } = data;
      const project = await this.getProjectById(projectId);
      const newTodo = new this.todoModel({
        name,
        description,
        project: project.project._id,
      });
      project.project.todos.push(newTodo);
      await project.project.save();
      return { success: true, todo: await newTodo.save() };
    } catch (error) {
      throw new InternalServerErrorException('Error adding todo to project');
    }
  }

  /**
   * Updates the status of a todo.
   * @param todoId - ID of the todo to update
   * @param updateData - New status for the todo
   * @returns Success status and updated todo
   */
  async updateTodoStatus(
    todoId: string,
    updateData: { status: boolean },
  ): Promise<{ success: boolean; todo: Todo }> {
    try {
      const { status } = updateData;
      const todo = await this.todoModel.findById(todoId).exec();
      if (!todo) {
        throw new NotFoundException('Todo not found');
      }
      todo.status = status;
      todo.updatedDate = new Date();
      const updatedTodo = await todo.save();
      return { success: true, todo: updatedTodo };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Error updating todo status');
      }
    }
  }

  /**
   * Updates a todo with new data.
   * @param todoId - ID of the todo to update
   * @param updateData - New data for the todo
   * @returns Success status and updated todo
   */
  async updateTodo(
    todoId: string,
    updateData: Partial<AddTodo>,
  ): Promise<{ success: boolean; updatedTodo: Todo }> {
    try {
      const todo = await this.todoModel.findById(todoId);
      if (!todo) {
        throw new NotFoundException(`Todo with ID ${todoId} not found`);
      }

      if (updateData.name) {
        todo.name = updateData.name;
      }
      if (updateData.description) {
        todo.description = updateData.description;
      }

      const updatedTodo = await todo.save();
      return { success: true, updatedTodo: updatedTodo };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating todo');
    }
  }

  /**
   * Deletes a todo by its ID.
   * @param todoId - ID of the todo to delete
   * @returns Success status
   */
  async deleteTodoById(todoId: string): Promise<{ success: boolean }> {
    try {
      const result = await this.todoModel
        .updateOne({ _id: todoId }, { isDeleted: true })
        .exec();
      // const result = await this.todoModel.deleteOne({ _id: todoId }).exec();
      // if (result.deletedCount === 0) {
      //   throw new NotFoundException('Todo not found');
      // }
      return { success: true };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Error deleting todo');
      }
    }
  }

  async getDeletedTodo(id: string): Promise<any> {
    try {
      const userId = id;
      const todos = await this.todoModel.find({ isDelted: true });
      return { deletedTodos: todos };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Exports a project's summary to a GitHub Gist.
   * @param projectId - ID of the project to export
   * @returns Success status and the URL of the created Gist
   */
  async exportProjectSummaryToGist(
    projectId: string,
  ): Promise<{ success: boolean; gistUrl: string }> {
    try {
      const project = await this.getProjectById(projectId);
      const markdownContent = this.createMarkdownSummary(project.project);
      const gistUrl = await this.createSecretGist(
        `${project.project.title}.md`,
        markdownContent,
      );
      return { success: true, gistUrl };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error exporting project summary to Gist',
      );
    }
  }

  /**
   * Creates a markdown summary for a project.
   * @param project - The project to summarize
   * @returns Markdown formatted summary
   */
  private createMarkdownSummary(project: Project): string {
    const completedTodos = project.todos.filter((todo) => todo.status).length;
    const totalTodos = project.todos.length;
    let summary = `# ${project.title}\n\nSummary: ${completedTodos} / ${totalTodos} todos completed.\n\n## Pending Todos\n`;
    project.todos
      .filter((todo) => !todo.status)
      .forEach((todo) => {
        summary += `- [ ] ${todo.name}\n\n${todo.description}\n\n`;
      });
    summary += '\n## Completed Todos\n';
    project.todos
      .filter((todo) => todo.status)
      .forEach((todo) => {
        summary += `- [x] ${todo.name}\n\n${todo.description}\n\n`;
      });
    return summary;
  }

  /**
   * Creates a secret Gist on GitHub with the provided file name and content.
   * @param fileName - Name of the file for the Gist
   * @param content - Content of the file
   * @returns URL of the created Gist
   */
  async createSecretGist(fileName: string, content: string): Promise<string> {
    try {
      const path = require('path');
      const markdownpdf = require('markdown-pdf');

      const response = await axios.post(
        this.gistUrl,
        {
          files: {
            [fileName]: {
              content,
            },
          },
          public: false,
        },
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
        },
      );

      const gistFiles = response.data.files;
      if (!gistFiles || !gistFiles[fileName]) {
        throw new Error(`File ${fileName} not found in the gist.`);
      }
      const fileContent = gistFiles[fileName].content;

      const outputDir = path.join(__dirname, '..', '..', 'gists');
      const markdownPath = path.join(outputDir, fileName);
      const pdfPath = path.join(outputDir, `${fileName}.pdf`);

      await fs.mkdir(outputDir, { recursive: true });
      await fs.writeFile(markdownPath, fileContent);

      markdownpdf()
        .from.string(fileContent)
        .to(pdfPath, (err) => {
          if (err) {
            throw new InternalServerErrorException('Error saving PDF');
          }
        });

      return response.data.html_url;
    } catch (error) {
      throw new InternalServerErrorException('Error creating Gist');
    }
  }
}
