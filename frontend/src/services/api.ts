import axios from 'axios';
import { ITask, ApiResponse } from '../types/task';

const API_URL = 'https://crud2-0backend.onrender.com/api/tasks';
const AUTH_API_URL = 'https://crud2-0backend.onrender.com/api/auth';

interface AuthUser {
  username: string;
  email: string;
}

export const registerUser = async (user: { username: string; email: string; password: string }): Promise<AuthUser> => {
  const response = await axios.post<ApiResponse<AuthUser>>(`${AUTH_API_URL}/register`, user);
  return response.data.data!;
};

export const loginUser = async (credentials: { identifier: string; password: string }): Promise<AuthUser> => {
  const response = await axios.post<ApiResponse<AuthUser>>(`${AUTH_API_URL}/login`, credentials);
  return response.data.data!;
};

// 1. GET ALL TASKS (Read All)
export const fetchTasks = async (): Promise<ITask[]> => {
  const response = await axios.get<ApiResponse<ITask[]>>(API_URL);
  return response.data.data || [];
};

// 2. VIEW TASK (Read Single)
export const fetchTaskById = async (id: string): Promise<ITask> => {
  const response = await axios.get<ApiResponse<ITask>>(`${API_URL}/${id}`);
  return response.data.data!;
};

// 3. CREATE TASK
export const createTaskAPI = async (task: { title: string; description: string; status: 'Open' | 'Completed' }): Promise<ITask> => {
  const response = await axios.post<ApiResponse<ITask>>(API_URL, task);
  return response.data.data!;
};

// 4. UPDATE TASK
export const updateTaskAPI = async (id: string, updatedData: { title: string; description: string; status: 'Open' | 'Completed' }) => {
  const response = await axios.put(`${API_URL}/${id}`, updatedData);
  return response.data;
};

// 5. DELETE TASK
export const deleteTaskAPI = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};