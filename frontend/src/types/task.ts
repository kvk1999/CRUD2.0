export type TaskStatus = 'Open' | 'Completed';

export type Role = 'admin' | 'user' | 'guest';

export interface IUser {
  username: string;
  email: string;
}

export type AuthenticatedUser = IUser & {
  role: Role;
};

export interface ITask {
  _id: string;
  username: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
}

export type CreateTaskDTO = Omit<ITask, '_id' | 'username'>;
export type CreateTaskPayload = Pick<CreateTaskDTO, 'title' | 'description' | 'status'>;
export type UpdateTaskPayload = Partial<Pick<ITask, 'title' | 'description' | 'status'>>;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}