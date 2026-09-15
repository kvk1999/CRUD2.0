export interface ITask {
  _id: string;
  title: string;
  description: string;
  status: 'Open' | 'Completed';
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}