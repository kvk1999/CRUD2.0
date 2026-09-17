import React, { useState, useEffect } from 'react';
import { Modal } from './components/modal';
import { fetchTasks, createTaskAPI, updateTaskAPI, deleteTaskAPI } from './services/api';
import { ITask } from './types/task';
import './App.css';

export default function App() {
  // Data states
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filterStatus, setFilterStatus] = useState<'All' | 'Open' | 'Completed'>('All');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Tracking states
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Open' | 'Completed'>('Open');

  // Load tasks
  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await fetchTasks();
      setTasks(data);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch tasks from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Reset form fields
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('Open');
    setCurrentTaskId(null);
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTaskAPI({ title, description, status });
      setIsCreateOpen(false);
      resetForm();
      loadTasks();
    } catch (err: any) {
      setError('Failed to save the task.');
    }
  };

  // Open Edit Modal with existing task data
  const openEditModal = (task: ITask) => {
    setCurrentTaskId(task._id!);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setIsEditOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTaskId) {
      try {
        await updateTaskAPI(currentTaskId, { title, description, status });
        setIsEditOpen(false);
        resetForm();
        loadTasks();
      } catch (err: any) {
        setError('Failed to update the task.');
      }
    }
  };

  // Handle Delete Confirmation Trigger
  const promptDelete = (id: string) => {
    setTaskToDelete(id);
    setIsDeleteOpen(true);
  };

  // Execute Deletion
  const executeDelete = async () => {
    if (taskToDelete) {
      try {
        await deleteTaskAPI(taskToDelete);
        setIsDeleteOpen(false);
        setTaskToDelete(null);
        loadTasks();
      } catch (err: any) {
        setError('Failed to delete the task.');
      }
    }
  };

  // Computed statistics
  const totalTasks = tasks.length;
  const openTasks = tasks.filter(t => t.status === 'Open').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;

  // Filtered tasks logic
  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'All') return true;
    return task.status === filterStatus;
  });

  return (
    <div className="container">
      <h1>Task Management System</h1>

      {error && <div className="error-banner">{error}</div>}

      {/* Dashboard Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span>Total Tasks</span>
          <h3>{totalTasks}</h3>
        </div>
        <div className="stat-card">
          <span>Open</span>
          <h3>{openTasks}</h3>
        </div>
        <div className="stat-card">
          <span>Completed</span>
          <h3>{completedTasks}</h3>
        </div>
      </div>

      {/* Header & Create Button */}
      <div className="app-header-row">
        <h2 className="app-header-title">
          Get All Tasks
        </h2>
        <button 
          onClick={() => { resetForm(); setIsCreateOpen(true); }}
          className="btn-primary-custom"
        >
          + Add
        </button>
      </div>

      {/* Status Filter Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button 
          onClick={() => setFilterStatus('All')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            background: filterStatus === 'All' ? '#4f46e5' : 'white',
            color: filterStatus === 'All' ? 'white' : 'var(--text-main)',
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          All Tasks
        </button>
        <button 
          onClick={() => setFilterStatus('Open')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            background: filterStatus === 'Open' ? '#f59e0b' : 'white',
            color: filterStatus === 'Open' ? 'white' : 'var(--text-main)',
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          Open
        </button>
        <button 
          onClick={() => setFilterStatus('Completed')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            background: filterStatus === 'Completed' ? '#10b981' : 'white',
            color: filterStatus === 'Completed' ? 'white' : 'var(--text-main)',
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          Completed
        </button>
      </div>

      {loading && <p style={{ textAlign: 'center' }}>Loading tasks...</p>}

      {/* Task Table View */}
      <div className="task-table-container">
        <table className="task-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No {filterStatus.toLowerCase()} tasks found.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                    #{String(task._id).slice(-6)}
                  </td>
                  <td style={{ fontWeight: 600, color: '#402a09' }}>
                    {task.title}
                  </td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.description || '—'}
                  </td>
                  <td>
                    <span className={`badge ${task.status === 'Completed' ? 'completed' : 'open'}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        onClick={() => openEditModal(task)}
                        className="btn-icon-edit"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => promptDelete(task._id!)}
                        className="btn-icon-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- CREATE TASK MODAL --- */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Task">
        <form onSubmit={handleCreateSubmit} className="task-form-clean">
          <div className="form-group">
            <label>Task Title *</label>
            <input 
              type="text" 
              required
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>
          <div className="form-group">
            <label>Task Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value as 'Open' | 'Completed')}
            >
              <option value="Open">Open</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => setIsCreateOpen(false)}
              className="btn-cancel-custom"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary-custom"
            >
              Add Task
            </button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT TASK MODAL --- */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Task">
        <form onSubmit={handleEditSubmit} className="task-form-clean">
          <div className="form-group">
            <label>Task Title *</label>
            <input 
              type="text" 
              required
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>
          <div className="form-group">
            <label>Task Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value as 'Open' | 'Completed')}
            >
              <option value="Open">Open</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => setIsEditOpen(false)}
              className="btn-cancel-custom"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary-custom"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Deletion">
        <div style={{ padding: '10px 0' }}>
          <p style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '24px' }}>
            Are you sure you want to delete this task?
          </p>
          <div className="form-actions">
            <button 
              onClick={() => setIsDeleteOpen(false)}
              className="btn-cancel"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button 
              onClick={executeDelete}
              className="btn-delete"
              style={{ flex: 1, background: 'var(--danger)', color: 'white', border: 'none', fontWeight: 600, padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}