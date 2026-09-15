import { Router, Request, Response } from 'express';
import { Task } from '../models/Task';

const router = Router();

// 1. GET ALL TASKS
router.get('/', async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET SINGLE TASK BY ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. CREATE TASK
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, status } = req.body;
    const newTask = await Task.create({ title, description, status });
    res.status(201).json({ success: true, data: newTask });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 4. UPDATE TASK
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, data: updatedTask });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 5. DELETE TASK
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;