import { Router } from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

// TASKS
router.get('/tasks', async (req, res) => {
  const tasks = await prisma.task.findMany({ include: { assignee: true, project: true }, orderBy: { createdAt: 'desc' } });
  res.json(tasks);
});

router.post('/tasks', async (req, res) => {
  const task = await prisma.task.create({ data: req.body });
  res.json(task);
});

router.put('/tasks/:id', async (req, res) => {
  const task = await prisma.task.update({ where: { id: req.params.id as string }, data: req.body });
  res.json(task);
});

// CALENDAR
router.get('/calendar', async (req, res) => {
  const events = await prisma.calendarEvent.findMany({ orderBy: { date: 'asc' } });
  res.json(events);
});

router.post('/calendar', async (req, res) => {
  const event = await prisma.calendarEvent.create({ data: req.body });
  res.json(event);
});

// TODOS
router.get('/todos', async (req, res) => {
  const todos = await prisma.todo.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(todos);
});

router.post('/todos', async (req, res) => {
  const todo = await prisma.todo.create({ data: req.body });
  res.json(todo);
});

router.put('/todos/:id', async (req, res) => {
  const todo = await prisma.todo.update({ where: { id: req.params.id as string }, data: req.body });
  res.json(todo);
});

// REVISIONS
router.get('/revisions', async (req, res) => {
  const revisions = await prisma.revision.findMany({ include: { project: true }, orderBy: { createdAt: 'asc' } });
  res.json(revisions);
});

router.post('/revisions', async (req, res) => {
  const revision = await prisma.revision.create({ data: req.body });
  res.json(revision);
});

router.put('/revisions/:id', async (req, res) => {
  const revision = await prisma.revision.update({ where: { id: req.params.id as string }, data: req.body });
  res.json(revision);
});

router.delete('/revisions/:id', async (req, res) => {
  await prisma.revision.delete({ where: { id: req.params.id as string } });
  res.json({ success: true });
});

// MAINTENANCE COSTS
router.get('/maintenance', async (req, res) => {
  const maintenanceCosts = await prisma.maintenanceCost.findMany({ include: { project: true }, orderBy: { createdAt: 'asc' } });
  res.json(maintenanceCosts);
});

router.post('/maintenance', async (req, res) => {
  const maintenanceCost = await prisma.maintenanceCost.create({ data: req.body });
  res.json(maintenanceCost);
});

router.put('/maintenance/:id', async (req, res) => {
  const maintenanceCost = await prisma.maintenanceCost.update({ where: { id: req.params.id as string }, data: req.body });
  res.json(maintenanceCost);
});

router.delete('/maintenance/:id', async (req, res) => {
  await prisma.maintenanceCost.delete({ where: { id: req.params.id as string } });
  res.json({ success: true });
});

export default router;
