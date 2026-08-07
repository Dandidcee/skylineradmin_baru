import { Router } from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

// TASKS
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({ include: { assignee: true, project: true }, orderBy: { createdAt: 'desc' } });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const task = await prisma.task.create({ data: req.body });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.put('/tasks/:id', async (req, res) => {
  try {
    const task = await prisma.task.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// CALENDAR
router.get('/calendar', async (req, res) => {
  try {
    const events = await prisma.calendarEvent.findMany({ orderBy: { date: 'asc' } });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch calendar events" });
  }
});

router.post('/calendar', async (req, res) => {
  try {
    const event = await prisma.calendarEvent.create({ data: req.body });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to create calendar event" });
  }
});

// TODOS
router.get('/todos', async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

router.post('/todos', async (req, res) => {
  try {
    const todo = await prisma.todo.create({ data: req.body });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: "Failed to create todo" });
  }
});

router.put('/todos/:id', async (req, res) => {
  try {
    const todo = await prisma.todo.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// REVISIONS
router.get('/revisions', async (req, res) => {
  try {
    const revisions = await prisma.revision.findMany({ include: { project: true }, orderBy: { createdAt: 'asc' } });
    res.json(revisions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch revisions" });
  }
});

router.post('/revisions', async (req, res) => {
  try {
    const revision = await prisma.revision.create({ data: req.body });
    res.json(revision);
  } catch (error) {
    res.status(500).json({ error: "Failed to create revision" });
  }
});

router.put('/revisions/:id', async (req, res) => {
  try {
    const revision = await prisma.revision.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(revision);
  } catch (error) {
    res.status(500).json({ error: "Failed to update revision" });
  }
});

router.delete('/revisions/:id', async (req, res) => {
  try {
    await prisma.revision.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete revision" });
  }
});

// MAINTENANCE COSTS
router.get('/maintenance', async (req, res) => {
  try {
    const maintenanceCosts = await prisma.maintenanceCost.findMany({ include: { project: true }, orderBy: { createdAt: 'asc' } });
    res.json(maintenanceCosts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch maintenance costs" });
  }
});

router.post('/maintenance', async (req, res) => {
  try {
    const maintenanceCost = await prisma.maintenanceCost.create({ data: req.body });
    res.json(maintenanceCost);
  } catch (error) {
    res.status(500).json({ error: "Failed to create maintenance cost" });
  }
});

router.put('/maintenance/:id', async (req, res) => {
  try {
    const maintenanceCost = await prisma.maintenanceCost.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(maintenanceCost);
  } catch (error) {
    res.status(500).json({ error: "Failed to update maintenance cost" });
  }
});

router.delete('/maintenance/:id', async (req, res) => {
  try {
    await prisma.maintenanceCost.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete maintenance cost" });
  }
});

export default router;
