import axios from 'axios';
import { ITask, ApiResponse } from '../types/task';

const API_BASE_URL = 'https://crud2-0backend.onrender.com/api';
const API_URL = `${API_BASE_URL}/tasks`;
const AUTH_API_URL = `${API_BASE_URL}/auth`;

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
export const fetchTasks = async (username: string): Promise<ITask[]> => {
  const response = await axios.get<ApiResponse<ITask[]>>(API_URL, { headers: { 'x-user': username } });
  return response.data.data || [];
};

// 2. VIEW TASK (Read Single)
export const fetchTaskById = async (id: string, username: string): Promise<ITask> => {
  const response = await axios.get<ApiResponse<ITask>>(`${API_URL}/${id}`, { headers: { 'x-user': username } });
  return response.data.data!;
};

// 3. CREATE TASK
export const createTaskAPI = async (task: { title: string; description: string; status: 'Open' | 'Completed' }, username: string): Promise<ITask> => {
  const response = await axios.post<ApiResponse<ITask>>(API_URL, task, { headers: { 'x-user': username } });
  return response.data.data!;
};

// 4. UPDATE TASK
export const updateTaskAPI = async (id: string, updatedData: { title: string; description: string; status: 'Open' | 'Completed' }, username: string) => {
  const response = await axios.put(`${API_URL}/${id}`, updatedData, { headers: { 'x-user': username } });
  return response.data;
};

// 5. DELETE TASK
export const deleteTaskAPI = async (id: string, username: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`, { headers: { 'x-user': username } });
};