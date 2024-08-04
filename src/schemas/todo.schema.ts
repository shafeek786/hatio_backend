import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Schema definition for a Todo item.
 * Represents a task with a name, description, status, and timestamps.
 */
@Schema()
export class Todo extends Document {
  @Prop({ required: true })
  name: string; // The name or title of the todo item

  @Prop({ required: true })
  description: string; // Detailed description of the todo item

  @Prop({ default: false })
  status: boolean; // Indicates whether the todo item is completed

  @Prop({ default: Date.now })
  createdDate: Date; // Timestamp of when the todo item was created

  @Prop({ default: Date.now })
  updatedDate: Date; // Timestamp of when the todo item was last updated
}

// Create schema instance for Todo class
export const TodoSchema = SchemaFactory.createForClass(Todo);
