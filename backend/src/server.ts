import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err: Error) => console.log(err));

// Example route
app.get('/api/tasks', async (req: Request, res: Response) => {
    try {
        // Your logic here
        res.json({ message: "Success" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Only listen locally if not running in production (Vercel serverless environment)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;