import { Schema, model, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'Open' | 'Completed';
  createdAt: Date;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  description: { type: String, default: '', trim: true },
  status: { type: String, enum: ['Open', 'Completed'], default: 'Open' },
  createdAt: { type: Date, default: Date.now }
}, { 
  collection: 'tasks' // <--- This forces Mongoose to use the exact collection name "tasks"
});

export const Task = model<ITask>('Task', TaskSchema);