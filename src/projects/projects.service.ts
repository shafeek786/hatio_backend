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

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(Todo.name) private readonly todoModel: Model<Todo>,
  ) {}
  private readonly gistUrl: string = 'https://api.github.com/gists';
  async createProject(
    title: string,
  ): Promise<{ success: boolean; project: Project }> {
    try {
      console.log('Creating project with title:', title);
      const newProject = new this.projectModel({ title });
      await newProject.save();
      console.log('Project created:', newProject);
      return { success: true, project: newProject };
    } catch (error) {
      console.error('Error creating project:', error);
      throw new InternalServerErrorException(
        `Error creating project: ${error.message}`,
      );
    }
  }

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
      console.error('Error creating project:', error);
      throw new InternalServerErrorException(
        `Error creating project: ${error.message}`,
      );
    }
  }

  async getAllProjects(): Promise<{ success: boolean; projects: Project[] }> {
    try {
      const projects = await this.projectModel
        .find()
        .populate('todos')
        .sort({ createdDate: -1 })
        .exec();
      return { success: true, projects: projects };
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving projects');
    }
  }

  async deleteProject(
    id: string,
  ): Promise<{ success: boolean; projects: Project[] }> {
    try {
      const result = await this.projectModel.deleteOne({ _id: id }).exec();

      if (result.deletedCount === 0) {
        throw new NotFoundException('Project not found');
      }

      const projects = await this.projectModel.find().exec();
      return { success: true, projects };
    } catch (error) {
      throw new InternalServerErrorException('Error deleting projects');
    }
  }
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

  async addTodoToProject(
    projectId: string,
    data: AddTodo,
  ): Promise<{ success: boolean; todo: Todo }> {
    try {
      console.log(data);
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

  async updateTodoStatus(
    todoId: string,
    updateData: { status: boolean },
  ): Promise<{ success: boolean; todo: Todo }> {
    try {
      const { status } = updateData;
      const todo = await this.todoModel.findById(todoId).exec();
      if (!todo) {
        console.error(`Todo with ID ${todoId} not found`);
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

  async deleteTodoById(todoId: string): Promise<{ success: boolean }> {
    try {
      const result = await this.todoModel.deleteOne({ _id: todoId }).exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException('Todo not found');
      }
      return { success: true };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Error deleting todo');
      }
    }
  }

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
      console.log(gistUrl);
      return { success: true, gistUrl };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error exporting project summary to Gist',
      );
    }
  }

  private createMarkdownSummary(project: Project): string {
    const completedTodos = project.todos.filter((todo) => todo.status).length;
    const totalTodos = project.todos.length;
    let summary = `# ${project.title}\n\nSummary: ${completedTodos} / ${totalTodos} completed.\n\n## Pending Todos\n`;
    project.todos
      .filter((todo) => !todo.status)
      .forEach((todo) => {
        summary += `- [ ] ${todo.description}\n`;
      });
    summary += '\n## Completed Todos\n';
    project.todos
      .filter((todo) => todo.status)
      .forEach((todo) => {
        summary += `- [x] ${todo.description}\n`;
      });
    return summary;
  }

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
            console.error('Error saving PDF:', err.message);
            throw new InternalServerErrorException('Error saving PDF');
          }
          console.log(`PDF saved to ${pdfPath}`);
        });

      return response.data.html_url;
    } catch (error) {
      console.error('Error creating Gist:', error);
      throw new InternalServerErrorException('Error creating Gist');
    }
  }
}
