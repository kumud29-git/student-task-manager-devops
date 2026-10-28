
const express = require('express');
const path = require('path');
const client = require('prom-client');

const app = express();
const PORT = 3000;

// Collect default Node.js and process metrics
client.collectDefaultMetrics();

// Custom counter for HTTP requests
const httpRequests = new client.Counter({
  name: 'task_manager_http_requests_total',
  help: 'Total number of HTTP requests received by the task manager',
  labelNames: ['method', 'route', 'status_code']
});

// Middleware to count HTTP requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequests.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: String(res.statusCode)
    });
  });
  next();
});

// Expose metrics for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// In-memory task storage
let tasks = [];
let nextId = 1;

// GET all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// POST add a new task
app.post('/tasks', (req, res) => {
  const { task } = req.body;
  if (!task || task.trim() === '') {
    return res.status(400).json({ error: 'Task cannot be empty' });
  }
  const newTask = { id: nextId++, text: task.trim() };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// DELETE a task by id
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  tasks.splice(index, 1);
  res.json({ message: 'Task deleted' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Student Task Manager running at http://localhost:${PORT}`);
});
