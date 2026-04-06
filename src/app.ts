import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import './config/db';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import recordRoutes from './modules/records/records.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import { AppError } from './utils/errors';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: AppError | Error, req: Request, res: Response, next: NextFunction) => {
  const status = (err as AppError).status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);