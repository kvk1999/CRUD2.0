# 🎸 Task Management System (GUTS-Inspired UI)

A full-stack task management application featuring custom handwritten typography, frosted glass container effects, and an Olivia Rodrigo-inspired aesthetic. Built as part of a full-stack CRUD development workflow.

---

## ✨ Features
* **Custom Typography:** Integrates custom `.ttf` handwritten fonts alongside **Montserrat** for clean hierarchical layout.
* **Aesthetic Styling:** Custom pink background palettes (`#f2b7c6`) with containerized glassmorphism.
* **Full CRUD Operations:** Create, Read, Update, and Delete tasks seamlessly.
* **Task State Management:** Filter and track tasks by their statuses (`Open`, `Completed`).
* **Responsive Layout:** Designed for clean user interaction.

---

## 🛠️ Tech Stack
* **Frontend:** React, CSS3, Webpack
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (MERN Stack)

---

## 📂 Project Structure
```text
CRUD2.0/
├── backend/
│   ├── models/
│   │   └── Task.js
│   ├── routes/
│   │   └── taskRoutes.js
│   └── server.js
└── frontend/
    └── src/
        ├── fonts/
        │   └── just-like-heaven.ttf
        ├── App.js
        └── App.css
```

---

## 🚀 Getting Started & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/CRUD2.0.git
cd CRUD2.0
```

### 2. Backend Setup
Navigate into the backend directory, install packages, and launch the server:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
```
Run the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a separate terminal window, navigate to the frontend directory, install dependencies, and start the app:
```bash
cd frontend
npm install
npm start
```

The frontend will run at `http://localhost:3000` and communicate with your backend server.

---

## 💻 Source Code Files

### `backend/server.js`
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Task Schema & Routes
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: 'Open' }
});

const Task = mongoose.model('Task', taskSchema);

// Get All Tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Task
app.post('/api/tasks', async (req, res) => {
    try {
        const newTask = new Task(req.body);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete Task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### `frontend/src/App.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=swap');

@font-face {
  font-family: 'Just Like Heaven';
  src: url('./fonts/just-like-heaven.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-image: url('https://png.pngtree.com/thumb_back/fh260/background/20240209/pngtree-task-management-business-planning-app-illustration-vector-image_15623958.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  color: #1e293b;
  margin: 0;
  padding: 40px 20px;
  min-height: 100vh;
}

.container {
  max-width: 850px;
  margin: auto;
  background: #f2b7c6;
  padding: 35px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

h1 {
  font-family: 'Just Like Heaven', cursive;
  font-size: 3rem;
  font-weight: normal;
  color: #402a09;
  text-align: center;
}

.task-form {
  background: #f2b7c6;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.task-form h2 {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  color: #402a09;
  margin: 0 0 10px 0;
}

.task-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f2b7c6;
  padding: 18px 20px;
  margin-bottom: 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.task-info h3 {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: #402a09;
}
```

---
## 💡 License
This project is open-source and available under the MIT License.
