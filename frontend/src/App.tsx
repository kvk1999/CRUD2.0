import React, { useState, useEffect } from 'react';
import { Modal } from './components/modal';
import { ITask } from './types/task';
import { createTaskAPI, deleteTaskAPI, fetchTasks, loginUser, registerUser, updateTaskAPI } from './services/api';
import './App.css';

const SESSION_KEY = 'task-manager-session';

export default function App() {
  // The session survives refreshes, while task ownership is enforced by the backend.
  const [currentUser, setCurrentUser] = useState<string | null>(() => localStorage.getItem(SESSION_KEY));
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authIdentifier, setAuthIdentifier] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Data states
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(false);
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
  const loadTasks = async (username: string) => {
    setLoading(true);
    try {
      setTasks(await fetchTasks(username));
      setError(null);
    } catch {
      setError('Failed to fetch tasks from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadTasks(currentUser);
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [currentUser]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = authMode === 'login' ? authIdentifier.trim() : authUsername.trim();
    const username = authMode === 'login' ? '' : identifier;
    const email = authEmail.trim().toLowerCase();
    const password = authPassword.trim();

    if (!identifier || password.length < 4 || (authMode === 'register' && (username.length < 3 || !/^\S+@\S+\.\S+$/.test(email)))) {
      setAuthError(authMode === 'login'
        ? 'Enter your username or email and a password with 4+ characters.'
        : 'Enter a valid email, a username with 3+ characters, and a password with 4+ characters.');
      return;
    }

    try {
      const user = authMode === 'register'
        ? await registerUser({ username, email, password })
        : await loginUser({ identifier, password });
      localStorage.setItem(SESSION_KEY, user.username);
      setCurrentUser(user.username);
      setAuthIdentifier('');
      setAuthUsername('');
      setAuthEmail('');
      setAuthPassword('');
      setAuthError(null);
    } catch (error: any) {
      setAuthError(error.response?.data?.message || 'Unable to connect to the authentication server.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setFilterStatus('All');
    setError(null);
  };

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
      if (!currentUser) return;
      await createTaskAPI({ title: title.trim(), description: description.trim(), status }, currentUser);
      setIsCreateOpen(false);
      resetForm();
      await loadTasks(currentUser);
    } catch {
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
        if (!currentUser) return;
        await updateTaskAPI(currentTaskId, { title: title.trim(), description: description.trim(), status }, currentUser);
        setIsEditOpen(false);
        resetForm();
        await loadTasks(currentUser);
      } catch {
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
        if (!currentUser) return;
        await deleteTaskAPI(taskToDelete, currentUser);
        setIsDeleteOpen(false);
        setTaskToDelete(null);
        await loadTasks(currentUser);
      } catch {
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

  if (!currentUser) {
    return (
      <div className="auth-shell">
        <div className="auth-panel">
          <p className="eyebrow">Task Management System</p>
          <h1>{authMode === 'login' ? 'Welcome back' : 'Create your workspace'}</h1>
          <p className="auth-intro">
            {authMode === 'login'
              ? 'Log in to open your private task dashboard.'
              : 'Register a unique account to keep your tasks separate.'}
          </p>
          {authError && <div className="error-banner">{authError}</div>}
          <form onSubmit={handleAuthSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor={authMode === 'login' ? 'identifier' : 'username'}>
                {authMode === 'login' ? 'Username or Email ID' : 'Username'}
              </label>
              <input
                id={authMode === 'login' ? 'identifier' : 'username'}
                type="text"
                value={authMode === 'login' ? authIdentifier : authUsername}
                onChange={e => authMode === 'login' ? setAuthIdentifier(e.target.value) : setAuthUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder={authMode === 'login' ? 'username or you@example.com' : undefined}
              />
            </div>
            {authMode === 'register' && (
              <div className="form-group">
                <label htmlFor="email">Email ID</label>
                <input id="email" type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} />
            </div>
            <button type="submit" className="btn-primary-custom auth-submit">
              {authMode === 'login' ? 'Log in' : 'Register'}
            </button>
          </form>
          <button className="auth-switch" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(null); }}>
            {authMode === 'login' ? 'New here? Create an account' : 'Already registered? Log in'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <p className="eyebrow">Private workspace</p>
          <h1>Task Management System</h1>
        </div>
        <div className="session-controls">
          <span className="user-indicator">Signed in as <strong>{currentUser}</strong></span>
          <button className="btn-logout" onClick={handleLogout}>Log out</button>
        </div>
      </div>

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