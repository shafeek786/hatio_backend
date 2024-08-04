import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Todo } from './todo.schema';

/**
 * Schema definition for a Project.
 * Represents a project with a title, associated user, creation date, and related todos.
 */
@Schema()
export class Project extends Document {
  @Prop({ required: true })
  title: string; // Title of the project

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: string; // ID of the user associated with the project

  @Prop({ default: Date.now })
  createdDate: Date; // Timestamp of when the project was created

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Todo' }] })
  todos: Todo[]; // List of todos related to the project
}

// Create schema instance for Project class
export const ProjectSchema = SchemaFactory.createForClass(Project);
