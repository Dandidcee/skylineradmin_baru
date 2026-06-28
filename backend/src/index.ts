import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import clientRoutes from './routes/client.routes';
import projectRoutes from './routes/project.routes';
import soloProjectRoutes from './routes/solo-project.routes';
import documentRoutes from './routes/document.routes';
import financeRoutes from './routes/finance.routes';
import statsRoutes from './routes/stats.routes';
import taskRoutes from './routes/task.routes';
import chatRoutes from './routes/chat.routes';
import publicRoutes from './routes/public.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/solo-projects', soloProjectRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/finances', financeRoutes); 
app.use('/api/payments', financeRoutes); 
app.use('/api/stats', statsRoutes);
app.use('/api/public', publicRoutes);
app.use('/api', taskRoutes);
app.use('/api/chat', chatRoutes);

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
