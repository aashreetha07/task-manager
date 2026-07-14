const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const protect = require('../middleware/auth');

// protect middleware runs before every route here
// req.userId is available in all routes below

// GET all tasks — only for logged in user
router.get('/', protect, async (req, res) => {
  try {
    // find tasks WHERE userId matches logged in user
    const tasks = await Task.find({ userId: req.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new task
router.post('/', protect, async (req, res) => {
  const task = new Task({
    title: req.body.title,
    userId: req.userId  // attach logged in user's id to task
  });
  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH — toggle completed
router.patch('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    task.completed = !task.completed;
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a task
router.delete('/:id', protect, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT — update task title
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    task.title = req.body.title  // update the title with new value
    const updatedTask = await task.save()
    res.json(updatedTask)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
module.exports = router;
