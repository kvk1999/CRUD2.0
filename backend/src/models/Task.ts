import { Schema, model, Document } from 'mongoose';

export type TaskStatus = 'Open' | 'Completed';

export interface TaskFields {
  username: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
}

export type ITask = TaskFields & Document;
export type CreateTaskDTO = Omit<TaskFields, 'username' | 'createdAt'>;
export type UpdateTaskDTO = Partial<Pick<TaskFields, 'title' | 'description' | 'status'>>;

const TaskSchema = new Schema<ITask>({
  username: { type: String, required: true, trim: true, index: true },
  title: { type: String, required: [true, 'Title is required'], trim: true },
  description: { type: String, default: '', trim: true },
  status: { type: String, enum: ['Open', 'Completed'], default: 'Open' },
  createdAt: { type: Date, default: Date.now }
}, { 
  collection: 'tasks' // <--- This forces Mongoose to use the exact collection name "tasks"
});

export const Task = model<ITask>('Task', TaskSchema);