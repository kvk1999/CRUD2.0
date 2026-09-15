import React, { useEffect, useState } from 'react';
import { ITask } from './types/task';
// CSS is loaded by the bundler; the project does not provide TypeScript declarations for it.
// @ts-ignore
import './App.css';
import { fetchTasks, fetchTaskById, createTaskAPI, updateTaskAPI, deleteTaskAPI } from './services/api';

function App() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Open' | 'Completed'>('Open');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingTask, setViewingTask] = useState<ITask | null>(null); // For View Task feature
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
  const data = await fetchTasks();
  setTasks(data);
} catch (err) {
  setError('Failed to fetch tasks from server.');
} finally {
    setLoading(false);
}
  };

  // 1 & 4. CREATE / UPDATE Task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    try {
      if (editingId) {
        const updated = await updateTaskAPI(editingId, { title, description, status });
        setTasks(tasks.map(t => (t._id === editingId ? updated : t)));
        setEditingId(null);
      } else {
        const newTask = await createTaskAPI({ title, description, status });
        setTasks([newTask, ...tasks]);
      }
      setTitle('');
      setDescription('');
      setStatus('Open');
      setError(null);
    } catch (err) {
      setError('Failed to save the task.');
    }
  };

  const handleEdit = (task: ITask) => {
    setEditingId(task._id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setViewingTask(null);
  };

  // 3. VIEW Single Task
  const handleView = async (id: string) => {
    try {
      const task = await fetchTaskById(id);
      setViewingTask(task);
    } catch (err) {
      setError('Failed to fetch task details.');
    }
  };

  // 5. DELETE Task
  const handleDelete = async (id: string) => {
    try {
      await deleteTaskAPI(id);
      setTasks(tasks.filter(t => t._id !== id));
      if (viewingTask?._id === id) setViewingTask(null);
    } catch (err) {
      setError('Failed to delete task.');
    }
  };

  return (
    <div className="container">
      <h1>Task Management System</h1>

      {error && <div className="error-banner">{error}</div>}

      {/* Task Form (Create / Update) */}
      <form onSubmit={handleSubmit} className="task-form">
        <h2>{editingId ? 'Update Task' : 'Create Task'}</h2>
        <input 
          type="text" 
          placeholder="Task Title *" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
        <textarea 
          placeholder="Task Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as 'Open' | 'Completed')}>
          <option value="Open">Open</option>
          <option value="Completed">Completed</option>
        </select>
        <button type="submit">{editingId ? 'Save Changes' : 'Add Task'}</button>
        {editingId && (
  <button type="button" className="btn-cancel" onClick={() => { setEditingId(null); setTitle(''); setDescription(''); }}>
    Cancel
  </button>
)}
      </form>

      {/* View Single Task Modal / Detail Box */}
      {viewingTask && (
        <div className="view-modal">
          <div className="modal-content">
            <h2>Task Details (View)</h2>
            <p><strong>ID:</strong> {viewingTask._id}</p>
            <p><strong>Title:</strong> {viewingTask.title}</p>
            <p><strong>Description:</strong> {viewingTask.description || 'No description provided.'}</p>
            <p><strong>Status:</strong> <span className={`badge ${viewingTask.status.toLowerCase()}`}>{viewingTask.status}</span></p>
            <p><strong>Created At:</strong> {new Date(viewingTask.createdAt).toLocaleString()}</p>
            <button onClick={() => setViewingTask(null)} className="btn-close">Close Details</button>
          </div>
        </div>
      )}

      {/* Task List (Get All Tasks) */}
      <div className="task-list">
        <h2>Get All Tasks</h2>
        {loading ? <p>Loading tasks...</p> : tasks.length === 0 ? <p>No tasks found.</p> : null}
        
        {tasks.map((task) => (
          <div key={task._id} className={`task-card ${task.status.toLowerCase()}`}>
            <div className="task-info">
              <h3>{task.title}</h3>
              <span className={`badge ${task.status.toLowerCase()}`}>{task.status}</span>
            </div>
            <div className="task-actions">
              <button onClick={() => handleView(task._id)} className="btn-view">View</button>
              <button onClick={() => handleEdit(task)} className="btn-edit">Update</button>
              <button onClick={() => handleDelete(task._id)} className="btn-delete">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;