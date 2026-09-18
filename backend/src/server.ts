import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Clean TypeScript imports (no .js extensions)
import taskRoutes from './routes/taskRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

// Test Route
app.get('/', (req: Request, res: Response) => {
  res.send('API is running successfully!');
});

// Database & Server Startup
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });