import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Todo } from './todo.schema';

@Schema()
export class Project extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ default: Date.now })
  createdDate: Date;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Todo' }] })
  todos: Todo[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
